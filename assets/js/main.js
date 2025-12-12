import chat from './chat.js';

const date = new Date();
const content = document.getElementById('content');
const scrollbar = document.getElementById('customScrollbar');
const thumb = document.getElementById('scrollbarThumb');
const innerPage = document.querySelector('.inner-page');
const mainWrapper = document.querySelector('.main-wrapper');
const isMobile = window.matchMedia('(max-width: 640px)').matches;

/***********************/
/* today's date & year */
/***********************/
const formattedDate = date.toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric" });
const getCurrentYear = date.getFullYear();
document.getElementById('currentYear').textContent = getCurrentYear;
document.getElementById('todaysDate').textContent = formattedDate;

/***********************/
/* custom scrollbar */
/***********************/
let isDragging = false;
let startY = 0;
let startScrollTop = 0;

function updateScrollbar() {
  const scrollHeight = content.scrollHeight + 42;
  const clientHeight = content.clientHeight;
  const scrollTop = content.scrollTop;

  // Calculate thumb height
  const thumbHeight = (clientHeight / scrollHeight) * scrollbar.clientHeight;
  thumb.style.height = thumbHeight + 'px';

  // Calculate thumb position
  const thumbTop = (scrollTop / scrollHeight) * scrollbar.clientHeight;
  thumb.style.top = thumbTop + 'px';
}

// Update scrollbar on content scroll
content.addEventListener('scroll', updateScrollbar);

// Thumb drag functionality
thumb.addEventListener('mousedown', (e) => {
  isDragging = true;
  startY = e.clientY;
  startScrollTop = content.scrollTop;
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  const deltaY = e.clientY - startY;
  const scrollHeight = content.scrollHeight;
  //const clientHeight = content.clientHeight;
  const scrollbarHeight = scrollbar.clientHeight;

  const scrollDelta = (deltaY / scrollbarHeight) * scrollHeight;
  content.scrollTop = startScrollTop + scrollDelta;
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

// Click on scrollbar track to jump
scrollbar.addEventListener('click', (e) => {
  if (e.target === thumb) return;

  const rect = scrollbar.getBoundingClientRect();
  const clickY = e.clientY - rect.top;
  const scrollbarHeight = scrollbar.clientHeight;
  const scrollHeight = content.scrollHeight;

  content.scrollTop = (clickY / scrollbarHeight) * scrollHeight;
});

// Initialize scrollbar
updateScrollbar();

// Update on window resize
window.addEventListener('resize', updateScrollbar);

/***********************/
/* Load and display chat content */
/***********************/
// whitelisted tag
const validTags = ['default', 'john-3-16', 'romans-8-28', 'psalm-23-1',
  'proverbs-3-5-6', 'isaiah-41-10', 'matthew-11-28',
  'philippians-4-13', '2-timothy-1-7', 'jeremiah-29-11',
  'galatians-5-22-23'];

fetch('/chat.json')
  .then(response => response.json())
  .then(data => {
    const urlParams = new URLSearchParams(window.location.search);
    const tag = urlParams.get('tag');
    const safeTag = validTags.includes(tag) ? tag : null;
    const content = safeTag && data[safeTag] ? data[safeTag] : data.default;

    const verseContent = document.querySelector('#verse-content');
    const verse = document.querySelector('#verse');
    const moreAbout = document.querySelector('#more-about');
    verseContent.textContent = content.content;
    verse.textContent = content.verse;
    moreAbout.textContent = `Want to know more about this${content.verse ? ' verse' : '?'}`;

    requestAnimationFrame(() => {
      requestAnimationFrame(updateQuoteDisplay);
    });
  });

// text ellipsis quote mark
function updateQuoteDisplay() {
  const quoteText = document.getElementById('verse-content');
  const quElement = document.querySelector('.ellipsis-end-quote');

  if (!quoteText || !quElement) return;

  // Get the line height
  const lineHeight = parseFloat(window.getComputedStyle(quoteText).lineHeight);

  // Get the total height of the content
  const totalHeight = quoteText.scrollHeight;

  // Calculate number of lines
  const lineCount = Math.round(totalHeight / lineHeight);

  // Show or hide the 'ellipsis-end-quote' element based on line count
  if (lineCount >= 14) {
    quElement.style.display = 'inline';
  } else {
    quElement.style.display = 'none';
  }
}

/***********************/
/* dynamic page */
/***********************/
let currentPage = 'home';
const homePage = document.querySelector('#home');
const chatButton = document.querySelector('.chat');

function navigateToPage(targetPageId) {
  const currentPageEl = document.getElementById(currentPage);
  const targetPageEl = document.getElementById(targetPageId);

  if (!currentPageEl || !targetPageEl || currentPage === targetPageId) return;

  // Determine direction
  const pages = ['home', 'chat'];
  const currentIndex = pages.indexOf(currentPage);
  const targetIndex = pages.indexOf(targetPageId);
  const isForward = targetIndex > currentIndex;

  // Hide chat button immediately when leaving chat
  if (currentPage === 'chat') {
    chatButton.style.display = 'none';
    homePage.style.display = 'block';
  }

  // Set initial state for target page
  targetPageEl.classList.remove('left', 'right', 'active');
  targetPageEl.classList.add(isForward ? 'right' : 'left');

  // Force reflow
  targetPageEl.offsetHeight;

  // Listen for transition end
  const handleTransitionEnd = (e) => {
    if (e.target === targetPageEl && e.propertyName === 'transform') {
      // Show chat button when chat transition completes
      if (targetPageId === 'chat') {
        chatButton.style.display = 'block';
        homePage.style.display = 'none';
      }

      // Update scrollbar after page transition
      updateScrollbar();

      targetPageEl.removeEventListener('transitionend', handleTransitionEnd);
    }
  };

  targetPageEl.addEventListener('transitionend', handleTransitionEnd);

  // Animate
  setTimeout(() => {
    currentPageEl.classList.remove('active');
    currentPageEl.classList.add(isForward ? 'left' : 'right');

    targetPageEl.classList.remove('left', 'right');
    targetPageEl.classList.add('active');

    //targetPageEl.scrollTop = 0;

    currentPage = targetPageId;
  }, 10);
}

const scrollableContainer = isMobile ? mainWrapper : innerPage;

document.querySelectorAll('.action-button').forEach(button => {
  button.addEventListener('click', function () {
    const targetPage = button.dataset.page;

    scrollableContainer.scrollTo({ top: 0, behavior: 'smooth' });

    if (targetPage === 'chat') chat();

    setTimeout(() => navigateToPage(targetPage), 200)
  });
});

window.addEventListener('popstate', function (event) {
  if (event.state && event.state.page) {
    navigateToPage(event.state.page);
  }
});

// Set initial history state
history.replaceState({ page: 'home' }, '', '');

/***********************/
/* Scroll to top */
/***********************/
const scrollToTopBtn = document.getElementById('main-logo');

function scrollToTop() {
  if (isMobile) {
    mainWrapper.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  } else if (innerPage) {
    innerPage.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
scrollToTopBtn.addEventListener('click', scrollToTop);