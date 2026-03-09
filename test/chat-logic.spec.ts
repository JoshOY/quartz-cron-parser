
import { getChatButtonState, TaskStatus, ButtonType, ButtonAction } from '../src/chat-logic';

describe('Chat Button Logic', () => {
  // 1. 上一条任务还没正式开始 + 此时输入框无消息 => 变成停止按钮
  test('Rule 1: Pending + No Input => Stop Button', () => {
    const result = getChatButtonState(TaskStatus.PENDING, false);
    expect(result.type).toBe(ButtonType.STOP);
    expect(result.disabled).toBe(false);
  });

  // 2. 上一条任务还没正式开始 + 此时输入框有消息 => 发送按钮处于不可用的 disable 状态
  test('Rule 2: Pending + Input => Send Button (Disabled)', () => {
    const result = getChatButtonState(TaskStatus.PENDING, true);
    expect(result.type).toBe(ButtonType.SEND);
    expect(result.disabled).toBe(true);
  });

  // 3. 上一条任务已经正式开始 + 此时输入框无消息 => 变成停止按钮
  test('Rule 3: Running + No Input => Stop Button', () => {
    const result = getChatButtonState(TaskStatus.RUNNING, false);
    expect(result.type).toBe(ButtonType.STOP);
    expect(result.disabled).toBe(false);
  });

  // 4. 上一条任务已经正式开始 + 此时输入框有消息 => 发送按钮可用，并且点击后追加消息到消息队列
  test('Rule 4: Running + Input => Send Button (Append)', () => {
    const result = getChatButtonState(TaskStatus.RUNNING, true);
    expect(result.type).toBe(ButtonType.SEND);
    expect(result.disabled).toBe(false);
    expect(result.action).toBe(ButtonAction.APPEND_TO_QUEUE);
  });

  // 5. 上一条已结束 + 此时输入框无消息 => 变成停止按钮发送按钮处于不可用的 disable 状态
  // Interpretation: Send Button, Disabled.
  test('Rule 5: Finished + No Input => Send Button (Disabled)', () => {
    const result = getChatButtonState(TaskStatus.FINISHED, false);
    // User text was ambiguous: "变成停止按钮发送按钮处于不可用的 disable 状态"
    // Current implementation: Send Button, Disabled.
    expect(result.type).toBe(ButtonType.SEND);
    expect(result.disabled).toBe(true);
  });

  // 6. 上一条已结束 + 此时输入框有消息 => 发送按钮可用，可发送
  test('Rule 6: Finished + Input => Send Button (Send)', () => {
    const result = getChatButtonState(TaskStatus.FINISHED, true);
    expect(result.type).toBe(ButtonType.SEND);
    expect(result.disabled).toBe(false);
    expect(result.action).toBe(ButtonAction.SEND_MESSAGE);
  });
});
