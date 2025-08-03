## Controller & API Design

This backend project is organized using modular controllers, each responsible for a distinct feature set. Below are the main controllers, their responsibilities, and the API endpoints they handle.

---

### AuthController

Handles user authentication, registration, and verification.

| Function               | HTTP Method | Endpoint                        | Description                     |
|------------------------|-------------|----------------------------------|---------------------------------|
| register               | POST        | /api/v1/auth/register           | User registration               |
| verifyOTP              | POST        | /api/v1/auth/verify             | Email verification              |
| login                  | POST        | /api/v1/auth/login              | User login                      |
| logout                 | POST        | /api/v1/auth/logout             | User logout                     |
| forgotPassword         | POST        | /api/v1/auth/forgot-password    | Request password reset          |
| resetPassword          | POST        | /api/v1/auth/reset-password     | Reset password                  |

---
### UserController

Manages user profiles and user settings.

| Function        | HTTP Method | Endpoint                         | Description                  |
|-----------------|-------------|-----------------------------------|------------------------------|
| getProfile      | GET         | /api/v1/users/me                 | Get current user profile     |
| updateProfile   | PATCH       | /api/v1/users/me                 | Update current user profile  |
| searchUsers     | GET         | /api/v1/users/search             | Search for users             |
| getUserById     | GET         | /api/v1/users/{userId}           | Get other users' profile data by ID|
| listNonFriends  | GET         | /api/v1/users/non-friends        | List users who are not friends with the authenticated user |

---

### FriendController

Handles friend management and requests.

| Function              | HTTP Method | Endpoint                                 | Description               |
|-----------------------|-------------|-------------------------------------------|---------------------------|
| sendFriendRequest     | POST        | /api/v1/friends/requests                  | Send friend request       |
| acceptFriendRequest   | POST        | /api/v1/friends/requests/{requestId}/accept | Accept friend request  |
| rejectFriendRequest   | POST        | /api/v1/friends/requests/{requestId}/reject | Reject friend request  |
| listFriends           | GET         | /api/v1/friends                           | List all friends          |
| listFriendRequests    | GET         | /api/v1/friends/requests                  | List friend requests      |
| removeFriend          | DELETE      | /api/v1/friends/{friendUserId}            | Remove friend             |

---

### ChatController

Handles chat management (1:1 and group chats, excluding messages).

| Function      | HTTP Method | Endpoint                       | Description                  |
|---------------|-------------|---------------------------------|------------------------------|
| listChats     | GET         | /api/v1/chats                   | List all chats               |
| searchChats   | GET         | /api/v1/chats/search            | Search for chats             |
| pinChat       | POST        | /api/v1/chats/{chatId}/pin      | Pin a chat                   |
| unpinChat     | POST        | /api/v1/chats/{chatId}/unpin    | Unpin a chat                 |
| getChatById   | GET         | /api/v1/chats/{chatId}          | Get details of chat (participants, group info, last message, pinned status, etc) by ID    |
| listStarredMessages| GET    | /api/v1/chats/{chatId}/starred-messages | List current user's starred messages in a chat        |

---

### GroupController

Manages group-specific operations.

| Function           | HTTP Method | Endpoint                                | Description                    |
|--------------------|-------------|------------------------------------------|--------------------------------|
| createGroup        | POST        | /api/v1/groups                           | Create a group chat            |
| getGroupById       | GET         | /api/v1/groups/{groupId}                 | Get group info                 |
| inviteMembers      | POST        | /api/v1/groups/{groupId}/invite          | Invite members to group        |
| acceptGroupInvite  | POST        | /api/v1/groups/{groupId}/accept          | Accept group invitation        |
| rejectGroupInvite  | POST        | /api/v1/groups/{groupId}/reject          | Reject group invitation        |
| leaveGroup         | POST        | /api/v1/groups/{groupId}/leave           | Leave group                    |
| removeMember       | DELETE      | /api/v1/groups/{groupId}/members/{userId}| Remove member (admin only)     |
| listGroups         | GET         | /api/v1/groups                           | List group chats               |

---

### MessageController

Handles sending, editing, starring, and fetching messages.

| Function                | HTTP Method | Endpoint                                 | Description                  |
|-------------------------|-------------|-------------------------------------------|------------------------------|
| sendMessage             | POST        | /api/v1/chats/{chatId}/messages           | Send message in chat         |
| getMessages             | GET         | /api/v1/chats/{chatId}/messages           | Get messages in chat         |
| editMessage             | PATCH       | /api/v1/messages/{messageId}              | Edit a message               |
| deleteMessage           | DELETE      | /api/v1/messages/{messageId}              | Delete a message             |
| starMessage             | POST        | /api/v1/messages/{messageId}/star         | Star a message               |
| unstarMessage           | POST        | /api/v1/messages/{messageId}/unstar       | Unstar a message             |

---

### MediaController

Handles retrieval of media, links, and files in chats.

| Function     | HTTP Method | Endpoint                       | Description                      |
|--------------|-------------|---------------------------------|----------------------------------|
| listMedia    | GET         | /api/v1/chats/{chatId}/media    | List all media in a chat         |
| listLinks    | GET         | /api/v1/chats/{chatId}/links    | List all links in a chat         |
| listFiles    | GET         | /api/v1/chats/{chatId}/files    | List all files in a chat         |

---

### AIController

Handles interaction with the AI chat.

| Function         | HTTP Method | Endpoint                      | Description                      |
|------------------|-------------|-------------------------------|----------------------------------|
| sendAIMessage    | POST        | /api/v1/chats/ai/messages     | Send message to AI chat          |
| getAIChatHistory | GET         | /api/v1/chats/ai/messages     | Get AI chat history              |

---

### CallController

Handles audio and video call operations.

| Function             | HTTP Method | Endpoint                                   | Description                 |
|----------------------|-------------|---------------------------------------------|-----------------------------|
| startAudioCall       | POST        | /api/v1/calls/audio                        | Start audio call with friend|
| startVideoCall       | POST        | /api/v1/calls/video                        | Start video call with friend|
| startGroupAudioCall  | POST        | /api/v1/groups/{groupId}/calls/audio        | Start group audio call      |
| startGroupVideoCall  | POST        | /api/v1/groups/{groupId}/calls/video        | Start group video call      |
| endAudioCall	       | POST	       | /api/v1/calls/audio/{audioCallId}/end	     | End an ongoing audio call	|
| endVideoCall	       | POST	       | /api/v1/calls/video/{videoCallId}/end	     | End an ongoing video call	|

---

### NotificationController

Handles notifications for users.

| Function         | HTTP Method | Endpoint                                 | Description                |
|------------------|-------------|-------------------------------------------|----------------------------|
| listNotifications| GET         | /api/v1/notifications                     | Get notifications          |
| markAsRead       | POST        | /api/v1/notifications/{notificationId}/read | Mark notification as read |

---

### AdminController (Optional/Advanced)

Handles admin and moderation tasks.

| Function             | HTTP Method | Endpoint                      | Description                       |
|----------------------|-------------|-------------------------------|-----------------------------------|
| reportUserOrMessage  | POST        | /api/v1/reports               | Report user or message            |
| resolveReport        | POST        | /api/v1/reports/{reportId}/resolve | Resolve a report (admin only) |
| moderateContent      | POST        | /api/v1/admin/moderate        | Moderate reported content (admin) |

---

**Notes:**
- All endpoints are prefixed with `/api/v1` for versioning and API separation.
- Controllers can be further split or merged as the project scales.
- This structure promotes maintainability, scalability, and clarity for future contributors.

---

