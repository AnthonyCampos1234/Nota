import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";
import axios from 'axios';

export const appwriteConfig = {
  endpoint: 'https://cloud.appwrite.io/v1',
  platform: 'com.anthony.nota',
  projectId: '6685ddb2000be9309d60',
  databaseId: '66c948a400219aad1ac1',
  userCollectionId: '66c948d3000fb7e98920',
  videoCollectionId: '6685df330025d0edd1f0',
  storageId: '6685e02700284382df46',
  friendsCollectionId: '66c94e030025f27fb532',
  friendRequestsCollectionId: '66c94f6000244d98cb22',
  assignmentsCollectionId: '66cd2e53001a9626d16b',
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

export { client, account, storage, avatars, databases };

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
        notifications: true,
        needsOnboarding: true, 
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

// Get friends
export async function getFriends(userId, limit = 20, offset = 0) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("User is not authenticated");
    }

    const friendships = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.friendsCollectionId,
      [
        Query.equal("userId", userId),
        Query.limit(limit),
        Query.offset(offset)
      ]
    );

    if (!friendships) throw new Error("Failed to fetch friends");

    const friendsWithDetails = await Promise.all(friendships.documents.map(async (friendship) => {
      const friendDetails = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        friendship.friendId
      );
      return {
        ...friendship,
        name: friendDetails.username,
        email: friendDetails.email,
        currentGPA: friendDetails.currentGPA,
        cumulativeGPA: friendDetails.cumulativeGPA,
        gpaVisibility: friendDetails.gpaVisibility
      };
    }));

    return friendsWithDetails;
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

    console.log("Friend requests fetched for user:", userId);
    console.log("Number of requests:", requests.documents.length);
    console.log("Requests:", JSON.stringify(requests.documents, null, 2));

    if (!requests) throw new Error("Failed to fetch friend requests");

    return requests.documents;
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    throw error;
  }
}

export async function sendFriendRequest(senderId, receiverEmail) {
  try {
    const potentialFriend = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("email", receiverEmail)]
    );

    if (potentialFriend.documents.length === 0) {
      throw new Error("User not found");
    }

    const receiverUser = potentialFriend.documents[0];

    if (senderId === receiverUser.$id) {
      throw new Error("You cannot send a friend request to yourself");
    }

    const senderUser = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      senderId
    );

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

    const formattedCreatedAt = new Date().toISOString();

    const newFriendRequest = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.friendRequestsCollectionId,
      ID.unique(),
      {
        senderId: senderId,  
        receiverId: receiverUser.$id,  
        senderName: senderUser.username,
        status: "pending",
        createdAt: formattedCreatedAt,
      }
    );

    console.log("New friend request created:", JSON.stringify(newFriendRequest, null, 2));

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

    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.friendRequestsCollectionId,
      requestId,
      { status: "accepted" }
    );

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

// Function to preprocess Schedule text
export function preprocessScheduleText(text) {
  if (typeof text !== 'string') {
    console.error('Input is not a string:', text);
    return '';
  }

  text = text.replace(/\*\*\*/g, '').replace(/\*\*/g, '').replace(/\*/g, '');

  text = text.replace(/ +/g, ' ');

  let lines = text.split('\n');

  let processedLines = lines.map(line => line.trim()).filter(line => line !== '');

  return processedLines.join('\n');
}

// preprocessGpaText function
function preprocessGpaText(text) {
  text = text.replace(/<[^>]*>/g, '');

  text = text.replace(/[\*\-_]/g, '');

  text = text.replace(/\s+/g, ' ');

  text = text.replace(/Select another Term/gi, '');

  text = text.trim();

  let lines = text.split('\n').filter(line => line.trim() !== '');

  return lines.join('\n');
}

// processGpaText function
export async function processGpaText(userId, gpaText) {
  try {
    const processedText = preprocessGpaText(gpaText);
    console.log('Processed GPA text:', processedText);

    const response = await axios.post(
      'https://utw7rcomf9.execute-api.us-east-2.amazonaws.com/default/TextractImageProcessor',
      { gpaText: processedText },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000 
      }
    );

    console.log('Full response from server:', JSON.stringify(response.data, null, 2));

    if (response.data && response.data.success && response.data.data) {
      let currentGPA, cumulativeGPA, cumulativeHours;

      if (response.data.data.summary) {
        currentGPA = response.data.data.summary.current_term?.gpa;
        cumulativeGPA = response.data.data.summary.cumulative?.gpa;
        cumulativeHours = response.data.data.summary.cumulative?.hours;
      } else if (response.data.data.gpa) {
        currentGPA = response.data.data.gpa.current;
        cumulativeGPA = response.data.data.gpa.cumulative;
        cumulativeHours = response.data.data.gpa.cumulativeHours;
      }

      if (currentGPA !== undefined && cumulativeGPA !== undefined && cumulativeHours !== undefined) {
        console.log(`Updating user settings with currentGPA: ${currentGPA}, cumulativeGPA: ${cumulativeGPA}, cumulativeHours: ${cumulativeHours}`);
        await updateUserSettings(userId, {
          currentGPA: parseFloat(currentGPA),
          cumulativeGPA: parseFloat(cumulativeGPA),
          cumulativeHours: parseFloat(cumulativeHours)
        });
        return {
          success: true,
          data: { currentGPA, cumulativeGPA, cumulativeHours }
        };
      } else {
        console.error('GPA data or cumulative hours not found in server response:', response.data);
        throw new Error('GPA data or cumulative hours not found in server response');
      }
    } else {
      console.error('Invalid response from server:', response.data);
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error("Error processing GPA text:", error);
    if (error.response) {
      console.error("Server responded with:", error.response.data);
    }
    throw error;
  }
}

// Function to process Schedule text
export async function updateUserSettings(userId, updates) {
  try {
    console.log("updateUserSettings - Starting update for user ID:", userId);
    console.log("updateUserSettings - Updates to be applied:", JSON.stringify(updates, null, 2));

    const validUpdates = {};

    if ('courses' in updates || 'courseSchedule' in updates) {
      const coursesToUpdate = updates.courses || updates.courseSchedule;
      console.log("updateUserSettings - Courses to update:", JSON.stringify(coursesToUpdate, null, 2));

      validUpdates.courseSchedule = Array.isArray(coursesToUpdate)
        ? coursesToUpdate.map(course => JSON.stringify(course))
        : coursesToUpdate;

      console.log("updateUserSettings - Formatted courseSchedule:", JSON.stringify(validUpdates.courseSchedule, null, 2));
    }

    if ('semester' in updates) {
      validUpdates.semester = updates.semester;
    }

    if ('totalCreditHours' in updates) {
      validUpdates.totalCreditHours = parseFloat(updates.totalCreditHours);
    }

    ['username', 'email', 'avatar', 'notifications', 'gpaVisibility', 'currentGPA', 'cumulativeGPA', 'cumulativeHours'].forEach(field => {
      if (field in updates) {
        validUpdates[field] = updates[field];
      }
    });

    if ('needsOnboarding' in updates) {
      validUpdates.needsOnboarding = updates.needsOnboarding;
    }

    console.log("updateUserSettings - Final valid updates to be sent to Appwrite:", JSON.stringify(validUpdates, null, 2));

    if (Object.keys(validUpdates).length > 0) {
      const updatedUser = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        userId,
        validUpdates
      );

      console.log("updateUserSettings - Updated user data in Appwrite:", JSON.stringify(updatedUser, null, 2));
      return updatedUser;
    } else {
      console.log("updateUserSettings - No valid updates to send to Appwrite");
      return null;
    }
  } catch (error) {
    console.error("updateUserSettings - Error updating user settings in Appwrite:", error.message);
    console.error("updateUserSettings - Error details:", error);
    throw error;
  }
}

export async function processScheduleText(userId, scheduleText) {
  try {
    console.log('Starting schedule text submission');
    const processedText = preprocessScheduleText(scheduleText);
    console.log('Processed schedule text:', processedText);

    console.log('Sending request to Lambda function');
    const response = await axios.post(
      'https://utw7rcomf9.execute-api.us-east-2.amazonaws.com/default/TextractImageProcessor',
      { scheduleText: processedText },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000 // 30 seconds timeout
      }
    );

    console.log('Received response from Lambda:', JSON.stringify(response.data, null, 2));

    if (response.data && response.data.success && response.data.data) {
      console.log('Schedule update successful');

      const { courses, totalCreditHours } = response.data.data;
      const semester = extractSemester(courses);

      const formattedCourses = formatCourses(courses);

      const updateData = {
        courseSchedule: formattedCourses,
        totalCreditHours: parseFloat(totalCreditHours),
        semester: semester
      };

      console.log('Updating user document with:', JSON.stringify(updateData, null, 2));

      const updatedUser = await updateUserSettings(userId, updateData);

      console.log('User document updated in Appwrite:', JSON.stringify(updatedUser, null, 2));

      return { success: true, data: { courses: formattedCourses, totalCreditHours, semester } };
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error("Error in processScheduleText:", error);
    if (error.response) {
      console.error("Server responded with:", error.response.data);
    }
    throw new Error(`Failed to process schedule: ${error.message}`);
  }
}

export async function createAssignment(assignmentData) {
  try {
    const newAssignment = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.assignmentsCollectionId,
      ID.unique(),
      {
        title: assignmentData.title,
        classTitle: assignmentData.classTitle,
        dueDate: assignmentData.dueDate,
        description: assignmentData.description,
        color: assignmentData.color || '#4A90E2', 
      }
    );
    return newAssignment;
  } catch (error) {
    console.error("Error creating assignment:", error);
    throw error;
  }
}
