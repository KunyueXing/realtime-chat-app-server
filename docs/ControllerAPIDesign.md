## Controller & API Design

This backend project is organized using modular controllers, each responsible for a distinct feature set. Below are the main controllers, their responsibilities, and the API endpoints they handle.

---

### AuthController

Handles user authentication, registration, and verification.

| Function       | HTTP Method | Endpoint                     | Description            | Protocol | Request Body                                                             |
| -------------- | ----------- | ---------------------------- | ---------------------- | -------- | ------------------------------------------------------------------------ |
| register       | POST        | /api/v1/auth/register        | User registration      | HTTP     | `{email: string, password: string, lastName: string, firstName: string}` |
| verifyOTP      | POST        | /api/v1/auth/verify          | Email verification     | HTTP     | `{otp: string, email: string}`                                           |
| login          | POST        | /api/v1/auth/login           | User login             | HTTP     | `{email: string, password: string}}`                                     |
| logout         | POST        | /api/v1/auth/logout          | User logout            | HTTP     | `{userId: string}`                                                       |
| forgotPassword | POST        | /api/v1/auth/forgot-password | Request password reset | HTTP     | `{email: string}`                                                        |
| resetPassword  | POST        | /api/v1/auth/reset-password  | Reset password         | HTTP     | `{newPassword: string}`                                                  |

---

### UserController

Manages user profiles and user settings.

| Function       | HTTP Method | Endpoint                       | Description                                                | Protocol |
| -------------- | ----------- | ------------------------------ | ---------------------------------------------------------- | -------- |
| updateProfile  | PATCH       | /api/v1/users/profile/{userId} | Update current user profile                                | HTTP     |
| searchUsers    | GET         | /api/v1/users/search           | Search for users                                           | HTTP     |
| getProfileById | GET         | /api/v1/users/profile/{userId} | Get users' profile data by ID                              | HTTP     |
| listNonFriends | GET         | /api/v1/users/non-friends      | List users who are not friends with the authenticated user | HTTP     |

---

### FriendController

Handles friend management and requests.

| Function            | HTTP Method | Endpoint                                    | Description           | Protocol         | HTTP Request Body                        |
| ------------------- | ----------- | ------------------------------------------- | --------------------- | ---------------- | ---------------------------------------- |
| sendFriendRequest   | POST        | /api/v1/friends/requests                    | Send friend request   | HTTP + WebSocket | `{receiverId: string, senderId: string}` |
| acceptFriendRequest | POST        | /api/v1/friends/requests/{requestId}/accept | Accept friend request | HTTP + WebSocket | `{requestId: string, userId: string}`    |
| rejectFriendRequest | POST        | /api/v1/friends/requests/{requestId}/reject | Reject friend request | HTTP             | `{requestId: string, userId: string}`    |
| listFriends         | GET         | /api/v1/friends                             | List all friends      | HTTP             | None                                     |
| listFriendRequests  | GET         | /api/v1/friends/requests                    | List friend requests  | HTTP             | None                                     |
| removeFriend        | DELETE      | /api/v1/friends/{friendUserId}              | Remove friend         | HTTP             | `{userId: string, friendId: string}`     |

---

### ChatController

Handles chat management (1:1 and group chats, excluding messages).

| Function            | HTTP Method | Endpoint                                | Description                                                                            | Protocol         |
| ------------------- | ----------- | --------------------------------------- | -------------------------------------------------------------------------------------- | ---------------- |
| listChats           | GET         | /api/v1/chats                           | List all chats                                                                         | HTTP             |
| newChats            | POST        | /api/v1/chats                           | Start new chats                                                                        | HTTP + WebSocket |
| searchChats         | GET         | /api/v1/chats/search                    | Search for chats                                                                       | HTTP             |
| pinChat             | POST        | /api/v1/chats/{chatId}/pin              | Pin a chat                                                                             | HTTP             |
| unpinChat           | POST        | /api/v1/chats/{chatId}/unpin            | Unpin a chat                                                                           | HTTP             |
| getChatById         | GET         | /api/v1/chats/{chatId}                  | Get details of chat (participants, group info, last message, pinned status, etc) by ID | HTTP             |
| listStarredMessages | GET         | /api/v1/chats/{chatId}/starred-messages | List current user's starred messages in a chat                                         | HTTP             |

---

### GroupController

Manages group-specific operations.

| Function          | HTTP Method | Endpoint                                  | Description                | Protocol         |
| ----------------- | ----------- | ----------------------------------------- | -------------------------- | ---------------- |
| createGroup       | POST        | /api/v1/groups                            | Create a group chat        | HTTP + WebSocket |
| getGroupById      | GET         | /api/v1/groups/{groupId}                  | Get group info             | HTTP             |
| inviteMembers     | POST        | /api/v1/groups/{groupId}/invite           | Invite members to group    | HTTP + WebSocket |
| acceptGroupInvite | POST        | /api/v1/groups/{groupId}/accept           | Accept group invitation    | HTTP + WebSocket |
| rejectGroupInvite | POST        | /api/v1/groups/{groupId}/reject           | Reject group invitation    | HTTP + WebSocket |
| leaveGroup        | POST        | /api/v1/groups/{groupId}/leave            | Leave group                | HTTP + WebSocket |
| removeMember      | DELETE      | /api/v1/groups/{groupId}/members/{userId} | Remove member (admin only) | HTTP + WebSocket |
| listGroups        | GET         | /api/v1/groups                            | List group chats           | HTTP             |

---

### MessageController

Handles sending, editing, starring, and fetching messages.

| Function      | HTTP Method | Endpoint                            | Description          | Protocol         |
| ------------- | ----------- | ----------------------------------- | -------------------- | ---------------- |
| sendMessage   | POST        | /api/v1/chats/{chatId}/messages     | Send message in chat | HTTP + WebSocket |
| getMessages   | GET         | /api/v1/chats/{chatId}/messages     | Get messages in chat | HTTP + WebSocket |
| editMessage   | PATCH       | /api/v1/messages/{messageId}        | Edit a message       | HTTP + WebSocket |
| deleteMessage | DELETE      | /api/v1/messages/{messageId}        | Delete a message     | HTTP + WebSocket |
| starMessage   | POST        | /api/v1/messages/{messageId}/star   | Star a message       | HTTP             |
| unstarMessage | POST        | /api/v1/messages/{messageId}/unstar | Unstar a message     | HTTP             |

---

### MediaController

Handles retrieval of media, links, and files in chats.

| Function  | HTTP Method | Endpoint                     | Description              | Protocol |
| --------- | ----------- | ---------------------------- | ------------------------ | -------- |
| listMedia | GET         | /api/v1/chats/{chatId}/media | List all media in a chat | HTTP     |
| listLinks | GET         | /api/v1/chats/{chatId}/links | List all links in a chat | HTTP     |
| listFiles | GET         | /api/v1/chats/{chatId}/files | List all files in a chat | HTTP     |

---

### AIController

Handles interaction with the AI chat.

| Function         | HTTP Method | Endpoint                  | Description             | Protocol         |
| ---------------- | ----------- | ------------------------- | ----------------------- | ---------------- |
| sendAIMessage    | POST        | /api/v1/chats/ai/messages | Send message to AI chat | HTTP + WebSocket |
| getAIChatHistory | GET         | /api/v1/chats/ai/messages | Get AI chat history     | HTTP + WebSocket |

---

### CallController

Handles audio and video call operations.

| Function            | HTTP Method | Endpoint                              | Description                  | Protocol         |
| ------------------- | ----------- | ------------------------------------- | ---------------------------- | ---------------- |
| startAudioCall      | POST        | /api/v1/calls/audio                   | Start audio call with friend | HTTP + WebSocket |
| startVideoCall      | POST        | /api/v1/calls/video                   | Start video call with friend | HTTP + WebSocket |
| startGroupAudioCall | POST        | /api/v1/groups/{groupId}/calls/audio  | Start group audio call       | HTTP + WebSocket |
| startGroupVideoCall | POST        | /api/v1/groups/{groupId}/calls/video  | Start group video call       | HTTP + WebSocket |
| endAudioCall        | POST        | /api/v1/calls/audio/{audioCallId}/end | End an ongoing audio call    | HTTP + WebSocket |
| endVideoCall        | POST        | /api/v1/calls/video/{videoCallId}/end | End an ongoing video call    | HTTP + WebSocket |

---

### NotificationController

Handles notifications for users.

| Function          | HTTP Method | Endpoint                                    | Description               | Protocol         |
| ----------------- | ----------- | ------------------------------------------- | ------------------------- | ---------------- |
| listNotifications | GET         | /api/v1/notifications                       | Get notifications         | HTTP + WebSocket |
| markAsRead        | POST        | /api/v1/notifications/{notificationId}/read | Mark notification as read | HTTP + WebSocket |

---

### AdminController (Optional/Advanced)

Handles admin and moderation tasks.

| Function            | HTTP Method | Endpoint                           | Description                       |
| ------------------- | ----------- | ---------------------------------- | --------------------------------- |
| reportUserOrMessage | POST        | /api/v1/reports                    | Report user or message            |
| resolveReport       | POST        | /api/v1/reports/{reportId}/resolve | Resolve a report (admin only)     |
| moderateContent     | POST        | /api/v1/admin/moderate             | Moderate reported content (admin) |

---

**Notes:**

- All endpoints are prefixed with `/api/v1` for versioning and API separation.
- Controllers can be further split or merged as the project scales.
- This structure promotes maintainability, scalability, and clarity for future contributors.

---
