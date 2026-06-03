import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Grid, TextField, Button, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, IconButton, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { itemService, messageService } from '../services/api';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import ForumIcon from '@mui/icons-material/Forum';

const Chat = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      loadMessages(selectedItem.id);
      // Disabled polling to avoid flooding the API while debugging send failures.
      // const interval = setInterval(() => {
      //   loadMessages(selectedItem.id);
      // }, 5000);
      // return () => clearInterval(interval);
    }
  }, [selectedItem]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadItems = async () => {
    try {
      const response = await itemService.getItems();
      setItems(response.data);
    } catch (err) {
      console.error('Failed to load items');
    }
  };

  const loadMessages = async (itemId) => {
    try {
      const response = await messageService.getMessages(itemId);
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to load messages');
    }
  };

  const handleSendMessage = async () => {
  if (!newMessage.trim() || !selectedItem) {
    console.log('No message or no item selected');
    return;
  }
  
  try {
    console.log('Sending message:', { content: newMessage, itemId: selectedItem.id });
    const response = await messageService.createMessage({
      content: newMessage,
      itemId: selectedItem.id
    });
    console.log('Message sent successfully:', response.data);
    setNewMessage('');
    loadMessages(selectedItem.id);
  } catch (err) {
    console.error('Failed to send message:', err.response?.data || err.message);
    alert('Failed to send message. Please try again.');
  }
};

  const handleDeleteMessage = async (messageId) => {
    if (user.role !== 'admin') return;
    try {
      // You'll need to add this endpoint to your backend
      await messageService.deleteMessage(messageId);
      loadMessages(selectedItem.id);
    } catch (err) {
      console.error('Failed to delete message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}/${day}/${year} - ${hours}:${minutes}`;
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#36393f' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ color: '#fff', mb: 4, fontWeight: 700 }}>
          <ForumIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Inquiry & Chat System
        </Typography>

        <Grid container spacing={3}>
          {/* Items List */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ backgroundColor: '#2f3136', borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ p: 2, backgroundColor: '#202225', borderBottom: '1px solid #202225' }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                  Items
                </Typography>
              </Box>
              <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                {items.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem
                      button
                      onClick={() => setSelectedItem(item)}
                      sx={{
                        backgroundColor: selectedItem?.id === item.id ? '#393c43' : 'transparent',
                        '&:hover': { backgroundColor: '#393c43' },
                        py: 2
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ backgroundColor: '#5865f2' }}>
                          {item.title.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>
                            {item.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ color: '#b9bbbe' }}>
                            {item.category} • {item.location}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider sx={{ backgroundColor: '#202225' }} />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Chat Area */}
          <Grid item xs={12} md={8}>
            {selectedItem ? (
              <Paper sx={{ backgroundColor: '#2f3136', borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 700 }}>
                {/* Chat Header */}
                <Box sx={{ p: 2, backgroundColor: '#202225', borderBottom: '1px solid #202225' }}>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                    {selectedItem.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b9bbbe' }}>
                    {selectedItem.category} • {selectedItem.location}
                  </Typography>
                </Box>

                {/* Messages */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, backgroundColor: '#2f3136' }}>
                  {messages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                      <Typography variant="body1" sx={{ color: '#b9bbbe' }}>
                        No messages yet. Start the conversation!
                      </Typography>
                    </Box>
                  ) : (
                    messages.map((message, index) => (
                      <Box key={message.id || index} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <Avatar sx={{ backgroundColor: '#5865f2', mr: 2, width: 40, height: 40 }}>
                            {message.User?.studentId?.charAt(0) || '?'}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, mr: 2 }}>
                                {message.User?.studentId || 'Unknown'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#b9bbbe' }}>
                                {formatDateTime(message.timestamp)}
                              </Typography>
                              {user.role === 'admin' && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteMessage(message.id)}
                                  sx={{ ml: 'auto', color: '#ed4245' }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                            <Typography variant="body1" sx={{ color: '#dcddde', whiteSpace: 'pre-wrap' }}>
                              {message.content}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Message Input */}
                <Box sx={{ p: 2, backgroundColor: '#36393f', borderTop: '1px solid #202225' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      placeholder={`Message #${selectedItem.title}`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#40444b',
                          color: '#dcddde',
                          '& fieldset': { borderColor: '#202225' },
                          '&:hover fieldset': { borderColor: '#202225' },
                          '&.Mui-focused fieldset': { borderColor: '#5865f2' }
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      sx={{ backgroundColor: '#5865f2', '&:hover': { backgroundColor: '#4752c4' } }}
                    >
                      <SendIcon />
                    </Button>
                  </Box>
                </Box>
              </Paper>
            ) : (
              <Paper sx={{ backgroundColor: '#2f3136', borderRadius: 2, p: 4, textAlign: 'center', height: 700, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <ForumIcon sx={{ fontSize: 80, color: '#b9bbbe', mb: 2 }} />
                <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>
                  Welcome to Inquiry & Chat
                </Typography>
                <Typography variant="body1" sx={{ color: '#b9bbbe' }}>
                  Select an item from the list to view and send messages.
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Chat;