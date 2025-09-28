import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Avatar,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Divider,
  TextField,
  IconButton,
  Badge,
  Paper,
  Chip,
} from '@mui/material';
import {
  Send,
  Search,
  MoreVert,
  Circle,
} from '@mui/icons-material';

const MessagesPage: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState(0);
  const [newMessage, setNewMessage] = useState('');

  // Mock data
  const conversations = [
    {
      id: 1,
      name: 'Priya Sharma',
      avatar: '/images/avatar-placeholder.svg',
      lastMessage: 'Hi! I saw your profile and would like to connect.',
      timestamp: '2 hours ago',
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: 2,
      name: 'Anjali Patel',
      avatar: '/images/avatar-placeholder.svg',
      lastMessage: 'Thank you for showing interest in my profile.',
      timestamp: '1 day ago',
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: 3,
      name: 'Kavya Reddy',
      avatar: '/images/avatar-placeholder.svg',
      lastMessage: 'Would love to know more about you.',
      timestamp: '2 days ago',
      unreadCount: 1,
      isOnline: true,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: 'other',
      text: 'Hi! I saw your profile and would like to connect.',
      timestamp: '10:30 AM',
    },
    {
      id: 2,
      sender: 'me',
      text: 'Hello! Thank you for reaching out. I would love to connect as well.',
      timestamp: '10:35 AM',
    },
    {
      id: 3,
      sender: 'other',
      text: 'That\'s great! Could you tell me more about your interests and hobbies?',
      timestamp: '10:40 AM',
    },
    {
      id: 4,
      sender: 'me',
      text: 'Sure! I enjoy reading, traveling, and cooking. I also love outdoor activities like hiking. What about you?',
      timestamp: '10:45 AM',
    },
    {
      id: 5,
      sender: 'other',
      text: 'Those sound wonderful! I also love traveling and trying new cuisines. We seem to have a lot in common.',
      timestamp: '10:50 AM',
    },
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Here you would typically send the message to the backend
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Messages
      </Typography>
      
      <Grid container spacing={2} sx={{ height: '70vh' }}>
        {/* Conversations List */}
        <Grid>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Search */}
            <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search conversations..."
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Box>
            
            {/* Conversations */}
            <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
              {conversations.map((conversation, index) => (
                <React.Fragment key={conversation.id}>
                  <ListItemButton
                    selected={selectedChat === index}
                    onClick={() => setSelectedChat(index)}
                    sx={{
                      py: 2,
                      '&.Mui-selected': {
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                        color={conversation.isOnline ? 'success' : 'default'}
                      >
                        <Avatar src={conversation.avatar} />
                      </Badge>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {conversation.name}
                          </Typography>
                          {conversation.unreadCount > 0 && (
                            <Chip
                              label={conversation.unreadCount}
                              color="primary"
                              size="small"
                              sx={{ minWidth: 24, height: 20 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              mb: 0.5,
                            }}
                          >
                            {conversation.lastMessage}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {conversation.timestamp}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Card>
        </Grid>

        {/* Chat Area */}
        <Grid>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Chat Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={conversations[selectedChat]?.avatar}
                  sx={{ mr: 2 }}
                />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {conversations[selectedChat]?.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Circle
                      sx={{
                        fontSize: 8,
                        color: conversations[selectedChat]?.isOnline ? 'success.main' : 'grey.400',
                        mr: 0.5,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {conversations[selectedChat]?.isOnline ? 'Online' : 'Offline'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <IconButton>
                <MoreVert />
              </IconButton>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'me' ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      bgcolor: message.sender === 'me' ? 'primary.main' : 'grey.100',
                      color: message.sender === 'me' ? 'primary.contrastText' : 'text.primary',
                      borderRadius: 2,
                      borderTopRightRadius: message.sender === 'me' ? 0 : 2,
                      borderTopLeftRadius: message.sender === 'me' ? 2 : 0,
                    }}
                  >
                    <Typography variant="body1" gutterBottom>
                      {message.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.8,
                        display: 'block',
                        textAlign: message.sender === 'me' ? 'right' : 'left',
                      }}
                    >
                      {message.timestamp}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>

            {/* Message Input */}
            <Box
              sx={{
                p: 2,
                borderTop: '1px solid #eee',
                display: 'flex',
                gap: 1,
              }}
            >
              <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <Send />
              </IconButton>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MessagesPage;