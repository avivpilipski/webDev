// Cookie utility functions
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
// Initialize preferences with default values if not set
function initializeUserPreferences() {
    const preferences = {
        userId: getCookie('userId') || Math.random().toString(36).substr(2, 9),
        theme: getCookie('theme') || 'minimal',
        sortPreference: getCookie('sortPreference') || 'date',
        username: getCookie('username') || 'Anonymous_' + Math.random().toString(36).substr(2, 4)
    };

    // Set cookies if they don't exist
    Object.entries(preferences).forEach(([key, value]) => {
        if (!getCookie(key)) {
            setCookie(key, value, 365);
        }
    });

    // Mount preferences component
    const PreferencesComponent = React.createElement(UserPreferences, {
        currentTheme: preferences.theme,
        currentSort: preferences.sortPreference,
        currentUsername: preferences.username,
        onUpdatePreferences: updatePreferences
    });
    
    ReactDOM.render(PreferencesComponent, document.getElementById('preferences-root'));
}

function updatePreferences(newPreferences) {
    Object.entries(newPreferences).forEach(([key, value]) => {
        setCookie(key, value, 365);
    });
    location.reload();
}
// Preferences Component
const PreferencesComponent = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [preferences, setPreferences] = React.useState({
        theme: getCookie('theme') || 'minimal',
        sortPreference: getCookie('sortPreference') || 'date',
        username: getCookie('username') || 'Anonymous'
    });

    const handleSave = () => {
        Object.entries(preferences).forEach(([key, value]) => {
            setCookie(key, value, 365);
        });
        setIsOpen(false);
        location.reload();
    };

    return React.createElement(React.Fragment, null,
        React.createElement('button', {
            className: 'preferences-button',
            onClick: () => setIsOpen(true)
        }, 'Preferences'),
        isOpen && React.createElement('div', {
            className: 'modal-overlay',
            onClick: () => setIsOpen(false)
        }),
        isOpen && React.createElement('div', {
            className: 'preferences-modal'
        },
            React.createElement('h2', null, 'Reading Preferences'),
            React.createElement('div', { className: 'form-group' },
                React.createElement('label', null, 'Theme'),
                React.createElement('select', {
                    value: preferences.theme,
                    onChange: (e) => setPreferences({ ...preferences, theme: e.target.value })
                },
                    React.createElement('option', { value: 'minimal' }, 'Minimal'),
                    React.createElement('option', { value: 'detailed' }, 'Detailed')
                )
            ),
            React.createElement('div', { className: 'form-group' },
                React.createElement('label', null, 'Sort By'),
                React.createElement('select', {
                    value: preferences.sortPreference,
                    onChange: (e) => setPreferences({ ...preferences, sortPreference: e.target.value })
                },
                    React.createElement('option', { value: 'date' }, 'Date'),
                    React.createElement('option', { value: 'length' }, 'Length')
                )
            ),
            React.createElement('div', { className: 'form-group' },
                React.createElement('label', null, 'Username'),
                React.createElement('input', {
                    type: 'text',
                    value: preferences.username,
                    onChange: (e) => setPreferences({ ...preferences, username: e.target.value })
                })
            ),
            React.createElement('button', {
                onClick: handleSave
            }, 'Save Changes')
        )
    );
};

// Blog posts data
const blogPosts = [
    {
        id: 'post1',
        title: "through another's eyes",
        subtitle: "one's trash, another's treasure",
        date: "Oct 13, 2024",
        author: "Aviv Pilipski",
        content: "Something got me laughing today. Really laughing. Thought it'd share...",
        preview: "For some context, I've been involved in the performing arts for much of my life...",
        length: "medium"
    },
    {
        id: 'post2',
        title: "Toni Morrison's Song of Solomon",
        subtitle: "pilate dead: reckoning with flight and descent",
        date: "Oct 09, 2024",
        author: "Aviv Pilipski",
        content: "\"Instead of being about a child, or a naive escape story, its about flight. It really is about flight\"...",
        preview: "While this reflection could easily focus on the nature of Morrison's Song of Solomon as a Bildungsroman...",
        length: "long"
    },
    {
        id: 'post3',
        title: "college decision reaction (only safeties!)",
        subtitle: "on being subconsciously conditioned and the road ahead",
        date: "Aug 12, 2024",
        author: "Aviv Pilipski",
        preview: "A reflection on college decisions and future paths...",
        length: "short"
    }
];

// Initialize Firebase (use your existing Firebase config)
const firebaseConfig = {
    apiKey: "AIzaSyAUtgK2UgiFbF5q77tuJY7IqfLPyp5y_sw",
    authDomain: "webdevaviv.firebaseapp.com",
    projectId: "webdevaviv",
    storageBucket: "webdevaviv.appspot.com",
    messagingSenderId: "903273183409",
    appId: "1:903273183409:web:54813b0fbcfa9736f70a90",
    measurementId: "G-TZYW5555JF"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Initialize anonymous auth
auth.signInAnonymously().catch(error => {
    console.error("Anonymous auth error:", error);
});

// Page content handlers
const pageContent = document.getElementById('page-content');

function sortPosts(posts) {
    const sortPreference = getCookie('sortPreference');
    const postsCopy = [...posts];
    
    if (sortPreference === 'date') {
        return postsCopy.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortPreference === 'length') {
        const lengthValues = { short: 1, medium: 2, long: 3 };
        return postsCopy.sort((a, b) => lengthValues[b.length] - lengthValues[a.length]);
    }
    return postsCopy;
}

async function renderComments(postId) {
    const commentsContainer = document.getElementById(`comments-${postId}`);
    if (!commentsContainer) return;

    try {
        const snapshot = await db.collection('comments')
            .where('postId', '==', postId)
            .orderBy('timestamp', 'desc')
            .get();

        commentsContainer.innerHTML = '';
        
        if (snapshot.empty) {
            commentsContainer.innerHTML = '<p>Be the first to comment!</p>';
            return;
        }

        snapshot.forEach(doc => {
            const comment = doc.data();
            const commentEl = document.createElement('div');
            commentEl.className = 'comment';
            commentEl.innerHTML = `
                <div class="comment-header">
                    <strong>${comment.username}</strong>
                    <span>${new Date(comment.timestamp?.toDate()).toLocaleDateString()}</span>
                </div>
                <div class="comment-content">${comment.content}</div>
            `;
            commentsContainer.appendChild(commentEl);
        });
    } catch (error) {
        console.error("Error loading comments:", error);
        commentsContainer.innerHTML = '<p>Error loading comments. Please try again later.</p>';
    }
}

async function submitComment(postId) {
    const commentInput = document.getElementById(`comment-input-${postId}`);
    const content = commentInput.value.trim();
    const username = getCookie('username');

    if (!content) {
        alert('Please enter a comment');
        return;
    }

    try {
        await db.collection('comments').add({
            postId,
            username,
            content,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        commentInput.value = '';
        renderComments(postId);
    } catch (error) {
        console.error("Error submitting comment:", error);
        alert('Error submitting comment. Please try again.');
    }
}

function renderPost(post) {
    const theme = getCookie('theme');
    const postElement = document.createElement('article');
    postElement.className = 'post';
    
    let postContent = `
        <a href="#" class="post-title">${post.title}</a>
        <div class="post-subtitle">${post.subtitle || ''}</div>
        <div class="post-meta">${post.date} • ${post.author}</div>
    `;
    
    if (theme === 'detailed') {
        postContent += `
            <div class="post-meta">Reading time: ${post.length === 'short' ? '5' : post.length === 'medium' ? '10' : '15'} minutes</div>
            <div class="post-preview">${post.preview}</div>
            <div class="post-tags">
                <span class="tag">${post.length} read</span>
                ${post.subtitle ? `<span class="tag">featured</span>` : ''}
            </div>
        `;
    } else {
        postContent += `
            <div class="post-preview">${post.preview}</div>
        `;
    }
    

    // Add comments section
    postContent += `
        <div class="comments-section">
            <h3>Comments</h3>
            <div class="comment-form">
                <textarea id="comment-input-${post.id}" placeholder="Add a comment..." class="comment-textarea"></textarea>
                <button onclick="submitComment('${post.id}')" class="comment-submit">Submit</button>
            </div>
            <div id="comments-${post.id}" class="comments-container"></div>
        </div>
    `;
    
    postElement.innerHTML = postContent;
    pageContent.appendChild(postElement);
    
    // Load comments for this post
    renderComments(post.id);
}

function renderHomePage() {
    pageContent.innerHTML = '';
    const sortedPosts = sortPosts(blogPosts);
    sortedPosts.slice(0, 5).forEach(renderPost);
}

function renderArchivePage() {
    pageContent.innerHTML = '<h2>Archive</h2>';
    const sortedPosts = sortPosts(blogPosts);
    sortedPosts.forEach(renderPost);
}

function renderAboutPage() {
    const userId = getCookie('userId');
    pageContent.innerHTML = `
        <div class="about-content">
            <h2>About Write of Spring</h2>
            <p>A collection of thoughts, reflections, and musings.</p>
            <p>Your unique reader ID: ${userId}</p>
            <div class="preferences">
                <h3>Your Reading Preferences</h3>
                <p>Theme: ${getCookie('theme')}</p>
                <p>Sort by: ${getCookie('sortPreference')}</p>
                <p>Username: ${getCookie('username')}</p>
                <button onclick="resetPreferences()">Reset Preferences</button>
            </div>
        </div>
    `;
}

function resetPreferences() {
    setCookie('theme', Math.random() < 0.5 ? 'minimal' : 'detailed', 365);
    setCookie('sortPreference', Math.random() < 0.5 ? 'date' : 'length', 365);
    setCookie('username', 'Anonymous_' + getCookie('userId').substr(0, 4), 365);
    location.reload();
}

// Navigation handlers
document.getElementById('home-link').addEventListener('click', (e) => {
    e.preventDefault();
    renderHomePage();
});

document.getElementById('archive-link').addEventListener('click', (e) => {
    e.preventDefault();
    renderArchivePage();
});

document.getElementById('about-link').addEventListener('click', (e) => {
    e.preventDefault();
    renderAboutPage();
});

// Initialize
initializeUserPreferences();
renderHomePage();

// Add these styles to your existing CSS
const additionalStyles = `
    .tag {
        background: var(--border);
        color: var(--text);
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        margin-right: 0.5rem;
    }

    .post-tags {
        margin-top: 1rem;
    }

    .preferences {
        margin-top: 2rem;
        padding: 1rem;
        border: 1px solid var(--border);
        border-radius: 4px;
    }

    .comments-section {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border);
    }

    .comment-form {
        margin-bottom: 1rem;
    }

    .comment-textarea {
        width: 100%;
        padding: 0.5rem;
        margin-bottom: 0.5rem;
        background: var(--background);
        color: var(--text);
        border: 1px solid var(--border);
        border-radius: 4px;
        min-height: 100px;
        resize: vertical;
    }

    .comment-submit {
        background: var(--text);
        color: var(--background);
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
    }

    .comment {
        margin: 1rem 0;
        padding: 1rem;
        border: 1px solid var(--border);
        border-radius: 4px;
    }

    .comment-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        color: var(--text-secondary);
    }

    button {
        background: var(--text);
        color: var(--background);
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 1rem;
    }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);