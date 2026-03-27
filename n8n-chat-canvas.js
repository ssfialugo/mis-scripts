(() => {
  const WEBHOOK_URL =
    'https://primary-production-fcae.up.railway.app/webhook/c6e48e3d-2f31-4840-9286-48e63234009d/chat';

  const CSS_URL =
    'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css';

  const JS_BUNDLE_URL =
    'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

  const CHAT_CONTAINER_ID = 'n8n-chat-canvas-mounted';
  const CHAT_FLAG = '__n8n_chat_loaded__';

  function shouldLoadChat() {
    const path = window.location.pathname;

    if (path.includes('/login')) return false;

    return true;
  }

  function loadCssOnce() {
    if (document.querySelector('link[data-n8n-chat="true"]')) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CSS_URL;
    link.setAttribute('data-n8n-chat', 'true');
    document.head.appendChild(link);
  }

  function removeDuplicateChatElements() {
    const floatingChats = document.querySelectorAll('.n8n-chat, [class*="n8n-chat"]');
    if (floatingChats.length > 1) {
      floatingChats.forEach((el, index) => {
        if (index > 0) el.remove();
      });
    }
  }

  async function mountChat() {
    if (!shouldLoadChat()) return;

    // Si ya fue cargado una vez, no volver a montarlo
    if (window[CHAT_FLAG]) {
      removeDuplicateChatElements();
      return;
    }

    // Si por alguna razón ya existe el contenedor, no crear otro
    if (document.getElementById(CHAT_CONTAINER_ID)) {
      window[CHAT_FLAG] = true;
      removeDuplicateChatElements();
      return;
    }

    const mountPoint = document.createElement('div');
    mountPoint.id = CHAT_CONTAINER_ID;
    document.body.appendChild(mountPoint);

    loadCssOnce();

    try {
      const mod = await import(JS_BUNDLE_URL);

      if (!mod?.createChat) {
        console.error('n8n chat: createChat no está disponible');
        return;
      }

      mod.createChat({
        webhookUrl: WEBHOOK_URL,
        target: `#${CHAT_CONTAINER_ID}`,
        initialMessages: [
          'Hola!',
          'Soy tu asistente virtual, Juanma, ¿en qué puedo ayudarte?'
        ]
      });

      // Marcamos que ya fue cargado
      window[CHAT_FLAG] = true;

      // Limpieza defensiva por si Canvas hizo alguna jugada rara
      setTimeout(removeDuplicateChatElements, 500);

    } catch (err) {
      console.error('Error cargando n8n chat en Canvas:', err);
    }
  }

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mountChat, { once: true });
    } else {
      mountChat();
    }
  }

  init();
})();
