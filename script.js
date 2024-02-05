// Client 

// Get Stored Data 
let storedToken = localStorage.getItem('jwtToke');
let storedUsername = localStorage.getItem('username');

// Set the username in the HTML 
const usernameElement = document.getElementById('username');
usernameElement.textContent = storedUsername; 

// Load page and event listeners 
document.addEventListener('DOMContentLoaded', ()=>{
    const baseUrl = window.location.origin;
    fetchPosts(baseUrl);

    if (storedToken){
        const storedRole = localStorage.getItem('userRole');
        if (storedRole === 'admin'){
            showAdminFeatures();
        }
    }

    const form = document.getElementById('new-post-form');
    if (form){
        form.addEventListener('submit', (event) => {createPost(event, baseUrl)});
    }    

    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (event) => {loginUser(event, baseUrl)});

    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', (event) => {registerUser(event, baseUrl)});

});

// Post details
const postDetailContainer = document.getElementById('post-detail-container');

// Add a listener for detail page
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urParams.get('post');
    if (postId){
        showPostDetail(postId);
    }
});

// Fetch posts

async function fetchPosts(baseUrl) {
    const res = await fetch (`${baseUrl}/posts`);
    const data = await res.json();
    const postsList = document.getElementById('posts-list');
    const isAdmin = localStorage.getItem('userRole') === 'admin';
    
    if (postsList){
        postsList.innerHTML = data.map((post,index)=>{
            const deleteButtonStyle = isAdmin ? '' : 'display:none';
            const updateButtinStyle = isAdmin ? '' : 'display:none';

            return `
            <div id="${post.id}" class="post">
                <img src="${post.imageUrl}" alt="image">
                <div class="post-title">
                    ${
                        index === 0
                        ? `<h1><a href="/post/${post._id}">${post.title}</a></h1>`
                        : `<h3><a href="/post/${post._id}">${post.title}</a></h3>`
                    }
                </div>
                ${
                    index === 0
                    ? `<span><p>${post.author}</p><p>${post.timestamp}</p></span>`
                    : ''
                }
                <div id="admin-buttons">
                    <button class="btn" style ="${deleteButtonStyle} onClick="deletePost('${post._id}','${baseUrl}')">Delete</button>

                    <button class="btn" style ="${deleteButtonStyle} onClick="showUpdateForm('${post._id}','${post.title}', ${post.content})">Update</button>
                </div>
                ${index === 0 ? '<hr/>': ''}
                ${index === 0 ? '<h2>All Articles</h2>': ''}
            </div> `;

        })
        .join('');
    }
}

async function createPost(event, baseUrl){
    event.preventDefault();
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const imageUrlInput = document.getElementById('image-url');
    // Get the values from the input fields
    const title = titleInput.value;
    const content = contentInput.value;
    const imageUrl = imageUrlInput.value;

    // Ensure that iputs are not empty
    if (!title || !content || !imageUrl){

        alert("Please fill in all fields.");
        return;
    }

    const newPost = {
        title,
        content,
        imageUrl,
        author: storedUsername,
        timestamp: new Date().toLocaleDateString(undefiend, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
    };

    const header = new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storedToken}`,
    });

    const requestOptions = {
        method: 'POST',
        header: header,
        body: JSON.stringify(newPost),
    };

    try{
        const response = await fetch(`${baseUrl}/posts`, requestOptions);
        if (!response.ok){
            const storedRole = localStorage.getItem('userRole');
            console.log(`Error creating the post: HTTP Status ${response.status}`);
        }else {
            // Clear the input data
            titleInput.value='';
            contentInput.value='';
            imageUrlInput.value='';
            alert('Create post successful!')
        }
    } catch (error) {
        console.log('An error occcured during the fetch:',error);
        alert('Create post failed.');
    }
    fetchPosts(baseUrl);
}

// Delete Post

async function deletePost(postId, baseUrl){
    const deleteUrl = `${baseUrl}/posts/${postId}`;
    try {
        const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${storedToken}`, 
            },
        });
        if(response.ok){
            alert('Delete post successful!');
            fetchPosts(baseUrl);
        } else {
            alert('Delete post failed.');
        }
    } catch(error){
        console.error(`Error while deleting post: ${error}`);
        alert('Delete post failed.')
    }
}

// Update form
function showUpdateForm(posted, title,content){
    const updateForm = `
    <form id="update-form">
        <input type="text" id="update-title" value= "${title}"/>
        <textarea id="update-content"> ${content}</textarea>
        <button type="submit">Update post</button>
    </form>`;

    const postElement = document.getElementById(postId);
    postElement.innerHTML += updateForm; 

    const form = document.getElementById('update-form');
    form.addEventListener('submit',(event)=> updateForm(event, postId));
}

// Update post 

async function updatePost(event, postId){
    event.preventDefault();
    const title = document.getElementById('update-title').value;
    const content = document.getElementById('update-content').value;
    const baseUrl = window.location.origin;

    // Ensure that inputs are not empty 

    if (!title || !content){
        alert('Please fill in all fields.');
        return;
    }
    const updatePost = {
        title,
        content,
    };

    try{
        const response = await fetch (`${baseUrl}/posts/${postId}`,{
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${storedToken}`, 
            },
            body: JSON.stringify(updatePost),
        });
        
        if(response.ok){
            alert('Update post successful!');
            fetchPosts(baseUrl);
        } else {
            alert('Update post failed.');
        }
    } catch(error){
        console.error(`Error occured during the fetch`, error);
        alert('Update post failed.');
    }
        
}



// Register user 

async function registerUser(event, baseUrl){
    event.preventDefault();
    const usernameInput = document.getElementById('register-username').value;
    const passwordInput = document.getElementById('register-password').value;
    const roleInput = document.getElementById('register-role').value;

    const username = usernameInput.value;
    const password = passwordInput.value;
    const role = roleInput.value;

    // Ensure that inputs are not empty 

    if (!username || !password || !role){
        alert('Please fill in all fields.');
        return;
    }
    const newUser = {username, password, role};

        const res = await fetch (`${baseUrl}/posts/register`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser),
        });
        const data = await res.json();

        if(data.success){
            alert('Registered successfully!');
            // Clear input fields
            usernameInput.value = '';
            passwordInput.value = '';
            roleInput.value = '';
        } else {
            alert('Registration failed.');
        }
}

// Loging user

async function loginUser(event, baseUrl){
    event.preventDefault();
    const usernameInput = document.getElementById('login-username').value;
    const passwordInput = document.getElementById('login-password').value;
    const username = usernameInput.value;
    const password = passwordInput.value;

    // Ensure that inputs are not empty 

    if (!username || !password){
        alert('Please fill in all fields.');
        return;
    }
    const user = {username, password};

        const res = await fetch (`${baseUrl}/posts/login`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });
        const data = await res.json();

        if(data.success){
            localStorage.setItem('jwtToken', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('username', username);

            // Close the hamburger menu if open
            linksContainer.classList.toggle('active');
            hamburger.classList.toggle('active');

            // Clear input fields
            usernameInput.value = '';
            passwordInput.value = '';
            location.reload();

            if(data.role === 'admin'){
                showAdminFeatures();
            }

        } else {
            alert('Login failed.');
        }
}

// Admin features

function showAdminFeatures(){
    const newPostDiv = document.getElementById('new-post-div');
    if (newPostDiv){
        newPostDiv.style.display = 'flex';
    }
    const allBtns = document.querySelectorAll('.btn'); 
    allBtns.forEach((btn)=>{
        if (btn){
            btn.style.display = 'block';
        }
    });
}

// Logout
document.addEventListener('DOMContentLoaded', () => {
    const baseUrl = window.location.origin;
    const registerDiv = document.getElementById('register-div');
    const loginDiv = document.getElementById('login-div');
    const logoutDiv = document.getElementById('logout-div');
    const logoutButton = document.getElementById('logout-button');

    if (storedToken){
        registerDiv.style.display = 'none';
        loginDiv.style.display = 'none';
        logoutDiv.style.display = 'flex';
        logoutButton.style.addEventListener('click',()=>{
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('username');
            location.reload();
        });

    }else {
        registerDiv.style.display = 'flex';
        loginDiv.style.display = 'flex';
        logoutDiv.style.display = 'none';
    }
});
