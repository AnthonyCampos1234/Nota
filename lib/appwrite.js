import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: 'https://cloud.appwrite.io/v1',
  platform: 'com.anthony.nota',
  projectId: '6685ddb2000be9309d60',
  databaseId: '6685def5000c7de9a666',
  userCollectionId: '6685df1700001dd64a5c',
  videoCollectionId: '6685df330025d0edd1f0',
  storageId: '6685e02700284382df46',
  friendsCollectionId: '669dbea30001b6d9de8d',
  friendRequestsCollectionId: 'friend_requests',
};

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export { client };

// Register user
export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    throw new Error(error);
  }
}

// Sign In
export async function signIn(email, password) {
  try {
    const session = await account.createEmailSession(email, password);

    return session;
  } catch (error) {
    throw new Error(error);
  }
}

// Get Account
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    throw new Error(error);
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Sign Out
export async function signOut() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error);
  }
}

// Upload File
export async function uploadFile(file, type) {
  if (!file) return;

  const { mimeType, ...rest } = file;
  const asset = { type: mimeType, ...rest };

  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);
    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
}

// Get File Preview
export async function getFilePreview(fileId, type) {
  let fileUrl;

  try {
    if (type === "video") {
      fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        appwriteConfig.storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
}

// Create Video Post
export async function createVideoPost(form) {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        creator: form.userId,
      }
    );

    return newPost;
  } catch (error) {
    throw new Error(error);
  }
}

// Get all video Posts
export async function getAllPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get video posts created by user
export async function getUserPosts(userId) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.equal("creator", userId)]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get video posts that matches search query
export async function searchPosts(query) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.search("title", query)]
    );

    if (!posts) throw new Error("Something went wrong");

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get latest created video posts
export async function getLatestPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(7)]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get friends
export async function getFriends(userId, limit = 20, offset = 0) {
  try {
    // Check if the user is authenticated
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("User is not authenticated");
    }

    const friends = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.friendsCollectionId,
      [
        Query.equal("userId", userId),
        Query.limit(limit),
        Query.offset(offset)
      ]
    );

    if (!friends) throw new Error("Failed to fetch friends");

    return friends.documents;
  } catch (error) {
    console.error("Error fetching friends:", error);
    throw error;
  }
}

// Get friend requests
export async function getFriendRequests(userId) {
  try {
    const requests = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.friendRequestsCollectionId,
      [
        Query.equal("receiverId", userId),
        Query.equal("status", "pending")
      ]
    );

    if (!requests) throw new Error("Failed to fetch friend requests");

    return requests.documents;
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    throw error;
  }
}

export async function sendFriendRequest(senderId, receiverEmail) {
  try {
    // First, find the user with the given email
    const potentialFriend = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("email", receiverEmail)]
    );

    if (potentialFriend.documents.length === 0) {
      throw new Error("User not found");
    }

    const receiverUser = potentialFriend.documents[0];

    // Check if the user is trying to send a request to themselves
    if (senderId === receiverUser.$id) {
      throw new Error("You cannot send a friend request to yourself");
    }

    // Get sender's information
    const senderUser = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      senderId
    );

    // Check if they are already friends
    const existingFriendship = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.friendsCollectionId,
      [
        Query.equal("userId", senderId),
        Query.equal("friendId", receiverUser.$id)
      ]
    );

    if (existingFriendship.documents.length > 0) {
      throw new Error("You are already friends with this user");
    }

    // Check if a friend request already exists
    const existingRequest = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.friendRequestsCollectionId,
      [
        Query.equal("senderId", senderId),
        Query.equal("receiverId", receiverUser.$id),
        Query.equal("status", "pending")
      ]
    );

    if (existingRequest.documents.length > 0) {
      throw new Error("Friend request already sent");
    }

    // Create the friend request
    const newFriendRequest = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.friendRequestsCollectionId,
      ID.unique(),
      {
        senderId: senderId,
        receiverId: receiverUser.$id,
        senderName: senderUser.username,
        status: "pending",
        createdAt: new Date().toISOString(),
      }
    );

    return newFriendRequest;
  } catch (error) {
    console.error("Error sending friend request:", error);
    throw error;
  }
}

// Accept friend request
export async function acceptFriendRequest(userId, requestId) {
  try {
    const request = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.friendRequestsCollectionId,
      requestId
    );

    if (!request || request.receiverId !== userId || request.status !== "pending") {
      throw new Error("Invalid friend request");
    }

    // Update the request status
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.friendRequestsCollectionId,
      requestId,
      { status: "accepted" }
    );

    // Add friends for both users
    await Promise.all([
      addFriend(userId, request.senderId),
      addFriend(request.senderId, userId)
    ]);

    return true;
  } catch (error) {
    console.error("Error accepting friend request:", error);
    throw error;
  }
}

// Deny friend request
export async function denyFriendRequest(userId, requestId) {
  try {
    const request = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.friendRequestsCollectionId,
      requestId
    );

    if (!request || request.receiverId !== userId || request.status !== "pending") {
      throw new Error("Invalid friend request");
    }

    // Update the request status
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.friendRequestsCollectionId,
      requestId,
      { status: "denied" }
    );

    return true;
  } catch (error) {
    console.error("Error denying friend request:", error);
    throw error;
  }
}

// addFriend function 
async function addFriend(userId, friendId) {
  try {
    const friendUser = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      friendId
    );

    const newFriendship = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.friendsCollectionId,
      ID.unique(),
      {
        userId: userId,
        friendId: friendId,
        name: friendUser.username,
        email: friendUser.email,
        gpa: friendUser.gpa,
        gpaVisibility: friendUser.gpaVisibility,
      }
    );

    return newFriendship;
  } catch (error) {
    console.error("Error adding friend:", error);
    throw error;
  }
}

export async function removeFriend(userId, friendId) {
  try {
    // Find and delete the friendship from the user's perspective
    const userFriendships = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.friendsCollectionId,
      [
        Query.equal("userId", userId),
        Query.equal("friendId", friendId)
      ]
    );

    if (userFriendships.documents.length > 0) {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.friendsCollectionId,
        userFriendships.documents[0].$id
      );
    }

    // Find and delete the friendship from the friend's perspective
    const friendFriendships = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.friendsCollectionId,
      [
        Query.equal("userId", friendId),
        Query.equal("friendId", userId)
      ]
    );

    if (friendFriendships.documents.length > 0) {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.friendsCollectionId,
        friendFriendships.documents[0].$id
      );
    }

    return true;
  } catch (error) {
    console.error("Error removing friend:", error);
    throw error;
  }
}

// Updated searchUsers function using separate queries
export async function searchUsers(searchTerm) {
  try {
    const usernameResults = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [
        Query.startsWith("username", searchTerm),
        Query.limit(5)
      ]
    );

    const emailResults = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [
        Query.startsWith("email", searchTerm),
        Query.limit(5)
      ]
    );

    const combinedResults = [
      ...usernameResults.documents,
      ...emailResults.documents
    ];

    // Remove duplicates
    const uniqueResults = Array.from(new Set(combinedResults.map(user => user.$id)))
      .map(id => combinedResults.find(user => user.$id === id));

    return uniqueResults.map(user => ({
      $id: user.$id,
      username: user.username,
      email: user.email,
      avatar: user.avatar
    }));
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
}
