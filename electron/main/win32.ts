import type { BrowserWindow } from "electron";
import os from "os";
import { CPP, ffi, L, NULL, ref, Win32ffi } from "win32-ffi";
import type { HANDLE, INT, KBDLLHOOKSTRUCT, LPARAM, MOUSEHOOKSTRUCT, RefStruct, WPARAM } from "win32-ffi/dist/ts";

const win32ffi = new Win32ffi();

const {
  CallNextHookEx,
  SetParent,
  SetWindowsHookExW,
  FindWindowExW,
  EnumWindows,
  FindWindowW,
  SendMessageW,
  PostMessageW,
  UnhookWindowsHookEx,
  GetMessage,
  TranslateMessage,
  DispatchMessageW,
  CreateThread,
  WindowFromPoint,
} = win32ffi.winFns();

// 鼠标事件钩子的回执编号
let lowLevelMouseHook: HANDLE = 0;
// 键盘事件钩子的回执编号
let lowLevelKeyboardHook: HANDLE = 0;

// 桌面层句柄
let SHELLDLL_DefViewHandle: HANDLE = 0;
// 桌面图标层句柄
let SysListView32Handle: HANDLE = 0;

/**
 * 寻找原始桌面句柄
 */
export function getProgmanHandle() {
  // 寻找原始桌面句柄
  return FindWindowW(L("Progman"), L("Program Manager"));
}

/**
 * 获取WorkerW句柄
 * @param workerOne true获取WorkerW1的句柄. false获取WorkerW2的句柄
 * @returns WorkerW句柄
 */
function getWorkerWHandle(workerOne: boolean) {
  // 寻找原始桌面句柄
  const Progman = getProgmanHandle();
  // 使用 0x052C 命令分割出两个 WorkerW
  SendMessageW(Progman, 0x052C, 0, 0);

  let findHandle = 0 as HANDLE;
  // 桌面层类名
  const lpszClass = L("SHELLDLL_DefView");
  // 循环所有底层句柄
  EnumWindows(ffi.Callback(CPP.BOOL, [CPP.HWND, CPP.LPARAM], (handle: HANDLE, _lparam: LPARAM) => {
    // 根据 桌面层类名 从 底层句柄 查询 桌面层句柄
    SHELLDLL_DefViewHandle = FindWindowExW(handle, 0, lpszClass, NULL);
    if (SHELLDLL_DefViewHandle !== 0) {
      // 从 底层句柄 中找到了 桌面层句柄
      // 根据 桌面层句柄 找 桌面图标层句柄
      SysListView32Handle = FindWindowExW(SHELLDLL_DefViewHandle, 0, L("SysListView32"), NULL);
      if (!workerOne) {
        // WorkerW 2 (没有鼠标键盘事件, 窗口在桌面图标之下)
        findHandle = FindWindowExW(0, handle, L("WorkerW"), NULL);
      } else {
        // WorkerW 1 (有鼠标键盘事件, 窗口在桌面图标之上)
        findHandle = handle;
      }
      return false;
    }
    return true;
  }), 0);
  return findHandle;
}

/**
 * 挂靠electron窗口到WorkerW下
 * @param electronWindowHandle electron窗口的句柄
 * @param workerOne true 挂靠到WorkerW1. false 挂靠到WorkerW2
 */
export function setParentToDesktop(electronWindowHandle: HANDLE, workerOne = true) {
  // 挂靠窗口至WorkerW
  setParentByHandle(electronWindowHandle, getWorkerWHandle(workerOne));
  if (!workerOne) {
    // 注册鼠标 & 键盘事件监听 新线程好像没用, electron会无反应(全屏页面不会重绘, 托盘菜单无响应)
    const newThreadTask = () => {
      addMouseAndKeyboardListener(electronWindowHandle);
      return true;
    };
    const newThreadCallback = () => ffi.Callback(CPP.INT, [CPP.PVOID], newThreadTask);
    CreateThread(null, 0, newThreadCallback(), NULL, 0, NULL);
  }
}

/**
 * 挂靠窗口到目标窗口
 * @param handle 需要挂靠窗口的句柄
 * @param parentHandle 挂靠目标的句柄
 */
export function setParentByHandle(handle: HANDLE, parentHandle: HANDLE) {
  // 修改electron窗口的父窗口
  SetParent(handle, parentHandle);
}

/**
 * 注册鼠标 & 键盘事件监听
 * @param electronWindowHandle electron窗口句柄
 */
function addMouseAndKeyboardListener(electronWindowHandle: HANDLE) {
  // 鼠标事件
  const lowLevelMouseTask = (nCode: INT, wParam: WPARAM, lParam: RefStruct) => {
    const mouse: MOUSEHOOKSTRUCT = lParam.deref();
    const pt = mouse.pt;
    const { x, y } = pt;
    // 获取鼠标下的窗口的句柄
    const currentHwnd = WindowFromPoint(pt);
    // 判断鼠标下的窗口是否是桌面层或者桌面图标层
    if (SHELLDLL_DefViewHandle === currentHwnd || SysListView32Handle === currentHwnd) {
      const lp = CPP.MAKELONG(x, y);
      if (wParam === CPP.WM_MOUSEMOVE) {
        SendMessageW(electronWindowHandle, wParam, 0, lp);
      } else if (wParam === CPP.WM_LBUTTONDOWN || wParam === CPP.WM_LBUTTONUP) {
        SendMessageW(electronWindowHandle, wParam, 0, lp);
      } else if (wParam === CPP.WM_RBUTTONDOWN || wParam === CPP.WM_RBUTTONUP) {
        SendMessageW(electronWindowHandle, wParam, 0, lp);
      }
    }
    return CallNextHookEx(0, nCode, wParam, ref.address(lParam.ref())); // need overwrite
  };

  const lowLevelMouseCallback = () => ffi.Callback(CPP.LRESULT, [CPP.INT, CPP.WPARAM, ref.refType(CPP.StructMOUSEHOOKSTRUCT)], lowLevelMouseTask);

  lowLevelMouseHook = SetWindowsHookExW(CPP.WH_MOUSE_LL, lowLevelMouseCallback(), 0, 0);

  // 键盘事件
  const lowLevelKeyboardTask = (nCode: INT, wParam: WPARAM, lParam: RefStruct) => {
    const keyboard: KBDLLHOOKSTRUCT = lParam.deref();
    if (wParam === 0x0100) {
      const lp = 1 | (keyboard.scanCode << 16) | (1 << 24) | (0 << 29) | (0 << 30) | (0 << 31);
      PostMessageW(electronWindowHandle, wParam, keyboard.vkCode, lp);
    } else if (wParam === 0x0101) {
      const lp = 1 | (keyboard.scanCode << 16) | (1 << 24) | (0 << 29) | (1 << 30) | (1 << 31);
      PostMessageW(electronWindowHandle, wParam, keyboard.vkCode, lp);
    }
    return CallNextHookEx(0, nCode, wParam, ref.address(lParam.ref())); // need overwrite
  };
  const lowLevelKeyboardCallback = () => ffi.Callback(CPP.LRESULT, [CPP.INT, CPP.WPARAM, ref.refType(CPP.StructKBDLLHOOKSTRUCT)], lowLevelKeyboardTask);

  lowLevelKeyboardHook = SetWindowsHookExW(CPP.WH_KEYBOARD_LL, lowLevelKeyboardCallback(), 0, 0);
  // 创建消息循环
  const msg = new CPP.StructMSG();
  while (GetMessage(msg.ref(), 0, 0, 0) > 0) {
    TranslateMessage(msg.ref());
    DispatchMessageW(msg.ref());
  }
}

/**
 * 注销鼠标 & 键盘事件监听
 */
export function removeMouseAndKeyboardListener() {
  if (lowLevelMouseHook !== 0) {
    UnhookWindowsHookEx(lowLevelMouseHook);
    lowLevelMouseHook = 0;
  }
  if (lowLevelKeyboardHook !== 0) {
    UnhookWindowsHookEx(lowLevelKeyboardHook);
    lowLevelKeyboardHook = 0;
  }
}

/**
 * 获取electron窗口的句柄
 * @param childWindow 窗口对象
 * @returns 窗口的句柄
 */
export function getElectronWindowHandle(childWindow: BrowserWindow) {
  // 将buffer类型的句柄进行转换
  function bufferCastInt32(buf: Buffer) {
    return os.endianness() === "LE" ? buf.readInt32LE() : buf.readInt32BE();
  }
  // 获取electron的句柄
  return bufferCastInt32(childWindow.getNativeWindowHandle());
}
