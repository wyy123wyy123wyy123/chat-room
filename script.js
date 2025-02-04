const socket = io();
let username = '';
let avatar = '';

function login() {
    username = document.getElementById('username-input').value.trim();
    if (username) {
        const fileInput = document.getElementById('avatar-input');
        fileInput.click();
        fileInput.onchange = function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    avatar = e.target.result;
                    socket.emit('login', { username, avatar });
                    document.getElementById('login-container').style.display = 'none';
                    document.getElementById('chat-container').style.display = 'flex';
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please select an avatar');
            }
        };
    } else {
        alert('Please enter a username');
    }
}

function sendMessage() {
    var input = document.getElementById('message-input');
    var message = input.value.trim();
    if (message && message.length <= 200) { // Prevent empty and overly long messages
        socket.emit('chat message', { username, message });
        input.value = ''; // Clear input field after sending
    } else {
        alert('Message cannot be empty or longer than 200 characters');
    }
}

socket.on('chat message', function(data) {
    var messagesDiv = document.getElementById('messages');
    var time = new Date().toLocaleTimeString();
    var color = data.color || '#000'; // Default color if not provided
    messagesDiv.innerHTML += `<div><strong style="color:${color}">${data.username} [${time}]:</strong> ${data.message}</div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to the bottom
});

socket.on('user list', function(users) {
    var usersDiv = document.getElementById('users');
    usersDiv.innerHTML = ''; // Clear previous user list
    users.forEach(function(user) {
        var li = document.createElement('li');
        li.textContent = user.username;
        li.style.color = user.color; // Set user's color
        usersDiv.appendChild(li);
    });
});
