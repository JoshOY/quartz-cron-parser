
export enum TaskStatus {
  PENDING = 'PENDING',   // 上一条任务还没正式开始
  RUNNING = 'RUNNING',   // 上一条任务已经正式开始
  FINISHED = 'FINISHED', // 上一条已结束
}

export enum ButtonType {
  STOP = 'STOP',
  SEND = 'SEND',
}

export enum ButtonAction {
  NONE = 'NONE',
  STOP_TASK = 'STOP_TASK',
  SEND_MESSAGE = 'SEND_MESSAGE',
  APPEND_TO_QUEUE = 'APPEND_TO_QUEUE',
}

export interface ButtonState {
  type: ButtonType;
  disabled: boolean;
  action: ButtonAction;
  description: string;
}

/**
 * Calculates the state of the Send/Stop button based on task status and input content.
 * 
 * Rules:
 * 1. PENDING + No Input => STOP button (Active?) -> Based on user desc: "Turn into Stop button"
 * 2. PENDING + Has Input => SEND button (Disabled)
 * 3. RUNNING + No Input => STOP button (Active)
 * 4. RUNNING + Has Input => SEND button (Enabled, Append to queue)
 * 5. FINISHED + No Input => SEND button (Disabled) - User said "Stop button Send button disabled", assuming Send disabled for idle state.
 * 6. FINISHED + Has Input => SEND button (Enabled, Send)
 */
export function getChatButtonState(taskStatus: TaskStatus, hasInput: boolean): ButtonState {
  // Case 1 & 2: Task Pending
  if (taskStatus === TaskStatus.PENDING) {
    if (!hasInput) {
      // 1. 上一条任务还没正式开始 + 此时输入框无消息 => 变成停止按钮
      return {
        type: ButtonType.STOP,
        disabled: false, // Assuming it's clickable to cancel the pending task
        action: ButtonAction.STOP_TASK,
        description: 'Cancel pending task'
      };
    } else {
      // 2. 上一条任务还没正式开始 + 此时输入框有消息 => 发送按钮处于不可用的 disable 状态
      return {
        type: ButtonType.SEND,
        disabled: true,
        action: ButtonAction.NONE,
        description: 'Cannot send while previous task is starting'
      };
    }
  }

  // Case 3 & 4: Task Running
  if (taskStatus === TaskStatus.RUNNING) {
    if (!hasInput) {
      // 3. 上一条任务已经正式开始 + 此时输入框无消息 => 变成停止按钮
      return {
        type: ButtonType.STOP,
        disabled: false,
        action: ButtonAction.STOP_TASK,
        description: 'Stop generating'
      };
    } else {
      // 4. 上一条任务已经正式开始 + 此时输入框有消息 => 发送按钮可用，并且点击后追加消息到消息队列
      return {
        type: ButtonType.SEND,
        disabled: false,
        action: ButtonAction.APPEND_TO_QUEUE,
        description: 'Append message to queue'
      };
    }
  }

  // Case 5 & 6: Task Finished
  if (taskStatus === TaskStatus.FINISHED) {
    if (!hasInput) {
      // 5. 上一条已结束 + 此时输入框无消息 => 变成停止按钮发送按钮处于不可用的 disable 状态
      // Note: User's text was "变成停止按钮发送按钮处于不可用的 disable 状态".
      // This is slightly contradictory or means "Stop button OR Send button disabled".
      // Usually in a finished state with no input, it's a disabled Send button.
      // However, if strictly following "Become Stop button", I will return STOP but disabled? 
      // Or maybe they meant "The Stop button becomes a Send button which is disabled"?
      // Let's assume standard UI behavior: Send Button, Disabled.
      return {
        type: ButtonType.SEND,
        disabled: true,
        action: ButtonAction.NONE,
        description: 'Enter text to send'
      };
    } else {
      // 6. 上一条已结束 + 此时输入框有消息 => 发送按钮可用，可发送
      return {
        type: ButtonType.SEND,
        disabled: false,
        action: ButtonAction.SEND_MESSAGE,
        description: 'Send message'
      };
    }
  }

  // Default fallback
  return {
    type: ButtonType.SEND,
    disabled: true,
    action: ButtonAction.NONE,
    description: 'Unknown state'
  };
}
