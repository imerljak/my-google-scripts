const properties = PropertiesService.getScriptProperties();
const LABEL='notify_me';


function start() {
  for (let data of _getEmailThreads()) {
    const { thread, message } = data;
    Logger.log(message.getSubject());
    _notifyTelegram({
      text: `Email received from: ${message.getFrom()}\nSubject: ${message.getSubject()}`
    });
    _removeLabel(thread);
  }
}

/**
 * @yield {{message: GmailApp.GmailMessage, thread: GmailApp.GmailThread}}
 */
function* _getEmailThreads() {
  const threads = GmailApp.search(`label:${LABEL}`);
  Logger.log('Threads: ' + threads.length)
  for (let i = 0; i < threads.length; i++) {
    const messages = threads[i].getMessages();
    Logger.log('Messages: ' + messages.length)
    for (let j = 0; j < messages.length; j++) {
      yield {message: messages[j], thread: threads[i]};
    }
  }
}

/**
 * @param {GmailApp.GmailThread} thread
 * @return {void}
 */
function _removeLabel(thread) {
  thread.getLabels().forEach(label => {
    if (LABEL === label.getName()) {
      thread.removeLabel(label);
    }
  })
}

/**
 * @param {{ text: string }} message
 */
function _notifyTelegram(message) {
  const chat_id = properties.getProperty('CHAT_ID');
  const token = properties.getProperty('BOT_TOKEN');
  const host = properties.getProperty('API_HOST');

  const payload = {
    chat_id, ...message
  };

  UrlFetchApp.fetch(`${host}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    payload: JSON.stringify(payload),
  })
}
