import { gql } from "@apollo/client";


export const GET_MESSAGES = gql`
  query GetMessages($chatId: uuid!) {
    messages(
      where: { chat_id: { _eq: $chatId } }
      order_by: { created_at: asc }
    ) {
      id
      sender
      user_id
      chat_id
      content
      created_at
    }
  }
`;


export const SEND_USER_MESSAGE = gql`
  mutation SendUserMessage(
    $userId: uuid!
    $send: String!
    $chatId: uuid!
    $content: String!
  ) {
    insert_messages(
      objects: { user_id: $userId, sender: $send, chat_id: $chatId, content: $content }
    ) {
      returning {
        id
        user_id
        sender
        chat_id
        content
        created_at
      }
    }
  }
`;


export const DELETE_ALL_MESSAGES_BY_CHATID = gql`
  mutation DeleteAllMessagesByChatId($chatId: uuid!) {
    delete_messages(where: { chat_id: { _eq: $chatId } }) {
      affected_rows
    }
  }
`;