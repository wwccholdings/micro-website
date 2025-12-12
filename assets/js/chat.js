export default function chat() {
  // Add required styles
  let style = document.createElement('style');
  style.textContent = `
      .after-content-exists {
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease;
        }
        .after-content-exists.show {
          opacity: 1;
          visibility: visible;
        }
      `;
  document.head.appendChild(style);

  // Create chat message HTML
  function createChatMessage(aiMessage) {
    return `<td 
              style="padding: 12px; background-color: #fff; box-shadow: 0 1px 6px 0 rgba(91, 114, 106, 0.08); border-radius: 12px;"
            >
              <table 
                valign="center" 
                role="presentation" 
                cellspacing="0" 
                cellpadding="0" 
                border="0" 
                width="100%"  
                style="margin: auto;" 
                class="after-content-exists" 
              >
                <tr>
                  <td valign="top" style="padding-bottom: 16px;">
                    <p style="font-family: 'Lora', Georgia, serif, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 20px; color: #181818; display: inline-block; vertical-align: middle; margin: 0;">
                        ${markdownToHtml(aiMessage)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>`;
      }

  // whitelisted tag
  const validTags = ['default', 'john-3-16', 'romans-8-28', 'psalm-23-1',
    'proverbs-3-5-6', 'isaiah-41-10', 'matthew-11-28',
    'philippians-4-13', '2-timothy-1-7', 'jeremiah-29-11',
    'galatians-5-22-23'];

  // Load and display chat content
  fetch('/chat.json')
    .then(response => response.json())
    .then(data => {
      const urlParams = new URLSearchParams(window.location.search);
      const tag = urlParams.get('tag');
      const safeTag = validTags.includes(tag) ? tag : null;
      const content = safeTag && data[safeTag] ? data[safeTag] : data.default;

      //const chatContainer = document.querySelector('#response').parentElement;
      const title = document.querySelector('#title');
      const human = document.querySelector('#human');
      title.textContent = content.title;
      human.textContent = content.human;

      let originalContent = createChatMessage(content.ai);
      // Initialize streaming
      setTimeout(() => {
        const temp = document.createElement('div');
        temp.textContent = originalContent;

        // Save the structure but clear text content
        responseContainer.innerHTML = originalContent;
        const textNodes = extractTextNodes(responseContainer);

        // Hide all after-content-exists elements initially
        const afterContentElements = responseContainer.getElementsByClassName('after-content-exists');
        Array.from(afterContentElements).forEach(element => {
          element.classList.remove('show');
        });

        // Clear all text nodes
        textNodes.forEach(({ node }) => {
          node.textContent = '';
        });

        // Start typing animation
        typeText(textNodes);
      }, 500);

    })
    .catch(error => console.error('Error loading chat content:', error));

  // Escape HTML BEFORE processing markdown
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Function to convert markdown to HTML
  function markdownToHtml(markdown) {
    // FIRST escape all HTML
    let escaped = escapeHtml(markdown);

    // Basic markdown conversion - expand as needed
    return escaped
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/\n\n/g, '</p><p>') // Paragraphs
      .replace(/\n/g, '<br>') // Line breaks
      .replace(/#{3} (.*)/g, (_, text) => '<h3>' + escapeHtml(text) + '</h3>') // H3
      .replace(/#{2} (.*)/g, (_, text) => '<h2>' + escapeHtml(text) + '</h2>') // H2
      .replace(/#{1} (.*)/g, (_, text) => '<h1>' + escapeHtml(text) + '</h1>'); // H1
  }
  const openPopupBtn = document.getElementById('openPopup');
  const popup = document.getElementById('popup');
  const innerPage = document.querySelector('.inner-page');
  const backToHomeBtn = document.getElementById('backToHome');
  const closePopup = document.querySelectorAll('.close-popup');
  const popupInner = document.querySelector('.popup-inner');

  openPopupBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    popup.classList.add('show');
  });

  innerPage.addEventListener('click', function (event) {
    if (!popupInner.contains(event.target)) {
      popup.classList.remove('show');
    }
  });

  closePopup.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      popup.classList.remove('show');
    });
  });

  function handleScroll(scrollTop) {
    if (scrollTop >= 127) {
      backToHomeBtn.style.display = 'flex';
      backToHomeBtn.style.opacity = '1';
    } else if (scrollTop >= 60) {
      backToHomeBtn.style.display = 'flex';
      backToHomeBtn.style.opacity = '0';
    } else {
      backToHomeBtn.style.display = 'none';
    }
  }

  // Initial state
  backToHomeBtn.style.display = 'none';

  // Attach event based on screen size
  function attachScrollHandler() {
    if (window.innerWidth > 640) {
      // Remove window scroll if exists
      window.removeEventListener('scroll', windowScrollHandler);
      // Add inner-page scroll
      innerPage.addEventListener('scroll', innerScrollHandler);
    } else {
      // Remove inner scroll if exists
      innerPage.removeEventListener('scroll', innerScrollHandler);
      // Add window scroll
      window.addEventListener('scroll', windowScrollHandler);
    }
  }

  // Define handlers
  function windowScrollHandler() {
    handleScroll(window.scrollY);
  }

  function innerScrollHandler() {
    handleScroll(innerPage.scrollTop);
  }

  // Attach initially
  attachScrollHandler();

  // Reattach on resize (when crossing 640px)
  window.addEventListener('resize', attachScrollHandler);

  const responseContainer = document.getElementById('response');

  // Function to extract text content from HTML elements
  function extractTextNodes(element, texts = []) {
    Array.from(element.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        texts.push({
          node: node,
          text: node.textContent
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        extractTextNodes(node, texts);
      }
    });
    return texts;
  }

  // Function to check and show elements with content
  function checkAndShowElement(element) {
    if (element && element.textContent.trim().length > 0) {
      element.classList.add('show');
    }
  }

  // Modified typeText function to handle after-content elements
  function typeText(textNodes, currentNodeIndex = 0, currentCharIndex = 0) {
    if (currentNodeIndex >= textNodes.length) {
      // After typing is complete, check all after-content elements
      const afterContentElements = responseContainer.getElementsByClassName('after-content-exists');
      Array.from(afterContentElements).forEach(element => {
        checkAndShowElement(element);
      });
      return;
    }

    const { node, text } = textNodes[currentNodeIndex];

    if (currentCharIndex === 0) {
      node.textContent = '';
    }

    if (currentCharIndex < text.length) {
      node.textContent += text[currentCharIndex];

      // Check parent elements for after-content-exists class
      let currentElement = node.parentElement;
      while (currentElement) {
        if (currentElement.classList.contains('after-content-exists')) {
          checkAndShowElement(currentElement);
        }
        currentElement = currentElement.parentElement;
      }

      setTimeout(() => {
        typeText(textNodes, currentNodeIndex, currentCharIndex + 1);
      }, Math.random() * 20 + 10);
    } else {
      setTimeout(() => {
        typeText(textNodes, currentNodeIndex + 1, 0);
      }, 100);
    }
  }

  const frame = document.querySelector('.mobile-frame');
  const chat = document.querySelector('.chat');

  function syncChatWidth() {
    // Only apply width styles if screen is wider than 640px
    if (window.innerWidth > 640) {
      const frameWidth = frame.clientWidth;
      chat.style.width = `${frameWidth - 29}px`;
      popupInner.style.width = `${frameWidth - 29}px`;
    } else {
      // Reset to default/auto width on smaller screens
      chat.style.width = '';
      popupInner.style.width = '';
    }
  }

  window.addEventListener('load', syncChatWidth);
  window.addEventListener('resize', syncChatWidth);
};