import React, { useState, useEffect, useRef } from 'react';

import { Box, Container, Typography, Grid, TextField, Button, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, IconButton, Paper, useMediaQuery } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { itemService, messageService } from '../services/api';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import ForumIcon from '@mui/icons-material/Forum';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Chat = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    loadItems();
  }, []);

  // Auto-select item from URL parameter
  useEffect(() => {
    if (items.length > 0) {
      const itemIdFromUrl = searchParams.get('itemId');
      if (itemIdFromUrl) {
        const item = items.find(i => i.id === parseInt(itemIdFromUrl));
        if (item) {
          setSelectedItem(item);
        }
      }
    }
  }, [items, searchParams]);

  const selectedItemId = selectedItem?.id ?? null;

  // IMPORTANT:
  // - Only fetch on item switch
  // - Never clear messages on "loading"
  // - Use optimistic append on send, and do NOT re-fetch after POST
  //   to prevent GET responses overwriting the UI and causing flash/vanish.
  const lastSelectedItemIdRef = useRef(null);

  useEffect(() => {
    if (selectedItemId == null) {
      setMessages([]);
      lastSelectedItemIdRef.current = null;
      return;
    }

    if (lastSelectedItemIdRef.current !== selectedItemId) {
      lastSelectedItemIdRef.current = selectedItemId;
      setLoadingMessages(true);
      messageService
        .getMessages(selectedItemId)
        .then((response) => {
          setMessages(response.data);
        })
        .catch((err) => {
          console.error('Failed to load messages:', err?.response?.data || err.message);
        })
        .finally(() => {
          setLoadingMessages(false);
        });
    }
  }, [selectedItemId]);

  // Auto-scroll to center when messages are loaded/updated or item is clicked
  useEffect(() => {
    if (!messagesEndRef.current) return;
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, [messages, selectedItemId, loadingMessages]);

  const loadItems = async () => {
    try {
      const response = await itemService.getItems();
      setItems(response.data);
    } catch (err) {
      console.error('Failed to load items');
    }
  };

  const [sendingMessage, setSendingMessage] = useState(false);
  const [justSentMessageId, setJustSentMessageId] = useState(null);

  const handleSendMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !selectedItem || sendingMessage) return;

    setSendingMessage(true);
    setJustSentMessageId(null);

    // Optimistic message that will never disappear due to GET overwrite.
    const optimisticId = `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const optimisticMessage = {
      id: optimisticId,
      content: trimmed,
      itemId: selectedItem.id,
      timestamp: new Date().toISOString(),
      User: user
        ? { studentId: user.studentId, displayName: user.displayName }
        : null
    };

    // 1) Immediately show the message
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      // 2) Send to backend
      const response = await messageService.createMessage({
        content: trimmed,
        itemId: selectedItem.id
      });

      const created = response?.data;

      // 3) Replace optimistic with real server message
      if (created && created.id != null) {
        setMessages((prev) => prev.map((m) => (m.id === optimisticId ? created : m)));
        setJustSentMessageId(created.id);
      }
    } catch (err) {
      // Revert optimistic on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      console.error('Failed to send message:', err.response?.data || err.message);
      alert(`Failed to send message. ${err.response?.data?.message || err.message}`);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (user.role !== 'admin') return;

    const currentId = selectedItem?.id ?? null;
    if (currentId == null) return;

    try {
      await messageService.deleteMessage(messageId);

      // Trigger a refresh by re-loading the current item id.
      // (We intentionally do not call any non-existent loadMessages() helper.)
      setLoadingMessages(true);
      messageService
        .getMessages(currentId)
        .then((response) => setMessages(response.data))
        .catch((err) => {
          console.error('Failed to load messages after delete:', err?.response?.data || err.message);
        })
        .finally(() => {
          setLoadingMessages(false);
        });
    } catch (err) {
      console.error('Failed to delete message');
    }
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
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
      <Container maxWidth="xl" sx={{ py: 4, '@media (max-width:600px)': { py: 2 } }}>

        <Box className="fade-in" sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ color: '#DC2626', mb: 1, fontWeight: 700 }}>
            <ForumIcon sx={{ mr: 2, verticalAlign: 'middle', color: '#DC2626' }} />
            Inquiry & Chat
          </Typography>
          <Typography variant="body1" sx={{ color: '#4B5563' }}>
            Ask questions about lost and found items
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Items List (hide entirely on mobile when a chat is selected) */}
          {(!isMobile || !selectedItem) && (
            <Grid item xs={12} md={4}>
              <Paper className="card-hover fade-in" sx={{ borderRadius: 2, overflow: 'hidden', border: '2px solid #FEE2E2' }}>
                <Box sx={{ p: 2, backgroundColor: '#DC2626', borderBottom: '2px solid #B91C1C' }}>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                    <SearchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Items
                  </Typography>
                </Box>
                <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                  {items.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <ListItem
                        button
                        onClick={() => setSelectedItem(item)}
                        className={`card-hover fade-in stagger-${Math.min(index + 1, 4)}`}
                        sx={{
                          backgroundColor: selectedItem?.id === item.id ? '#FEE2E2' : 'transparent',
                          '&:hover': { backgroundColor: '#FEE2E2' },
                          py: 2,
                          cursor: 'pointer'
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ backgroundColor: '#DC2626', fontWeight: 700 }}>
                            {item.title.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ color: '#1A1A2E', fontWeight: 600 }}>
                              {item.title}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ color: '#4B5563' }}>
                              {item.category} • {item.location}
                            </Typography>
                          }
                        />
                      </ListItem>
                      <Divider sx={{ backgroundColor: '#FEE2E2' }} />
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>
          )}

          {/* Chat Area (hide entire right panel on mobile when no chat is selected) */}
          {(!isMobile || selectedItem) && (
            <Grid item xs={12} md={8}>
              {selectedItem ? (
                <Paper className="card-hover fade-in" sx={{ borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 700, border: '2px solid #FEE2E2' }}>
                  {/* Chat Header */}
                  <Box sx={{ p: 2, backgroundColor: '#DC2626', borderBottom: '2px solid #B91C1C' }}>
                    {/* Mobile Back Button */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 1 }}>
                      <IconButton
                        onClick={() => {
                          setSelectedItem(null);
                          setMessages([]);
                          setNewMessage('');
                        }}
                        sx={{ color: '#fff' }}
                        aria-label="Back to items"
                      >
                        <ArrowBackIcon />
                      </IconButton>
                      <Typography variant="body2" sx={{ color: '#FEE2E2', alignSelf: 'center', ml: 0.5 }}>
                        Back
                      </Typography>
                    </Box>

                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                      {selectedItem.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#FEE2E2' }}>
                      {selectedItem.category} • {selectedItem.location}
                    </Typography>
                  </Box>

                  {/* Messages */}
                  <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, backgroundColor: '#fff' }}>
                    {messages.length === 0 ? (
                      <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Typography variant="body1" sx={{ color: '#4B5563' }}>
                          No messages yet. Start the conversation!
                        </Typography>
                      </Box>
                    ) : (
                      messages.map((message, index) => (
                        <Box
                          key={message.id || index}
                          sx={{ mb: 3 }}
                          className={`fade-in stagger-${Math.min(index + 1, 4)}${justSentMessageId && (message.id === justSentMessageId) ? ' bbai-pop' : ''}`}
                        >

                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <Avatar sx={{ backgroundColor: '#DC2626', mr: 2, width: 40, height: 40, fontWeight: 700 }}>
                              {message.User?.studentId?.charAt(0) || '?'}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="subtitle1" sx={{ color: '#1A1A2E', fontWeight: 700, mr: 1 }}>
                                  {message.User?.displayName || 'Unknown'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6B7280', mr: 2, fontWeight: 500 }}>
                                  ({message.User?.studentId || '?'})
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#4B5563' }}>
                                  {formatDateTime(message.timestamp)}
                                </Typography>
                                {user.role === 'admin' && (
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteMessage(message.id)}
                                    sx={{ ml: 'auto', color: '#DC2626' }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                              <Typography variant="body1" sx={{ color: '#1A1A2E', whiteSpace: 'pre-wrap' }}>
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
                  <Box sx={{ p: 2, backgroundColor: '#FEE2E2', borderTop: '2px solid #DC2626' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        placeholder={sendingMessage ? 'Sending...' : `Message about ${selectedItem.title}...`}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onPaste={(e) => {
                          // keep default paste behavior; bugfix placeholder to avoid interfering events
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        variant="outlined"
                        size="small"
                        disabled={sendingMessage}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff',
                            '& fieldset': { borderColor: '#DC2626' },
                            '&:hover fieldset': { borderColor: '#B91C1C' },
                            '&.Mui-focused fieldset': { borderColor: '#DC2626' }
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleSendMessage}
                        disabled={sendingMessage}
                        className="bbai-tap-press"
                        sx={{ backgroundColor: '#DC2626', '&:hover': { backgroundColor: '#B91C1C' } }}
                      >
                        <SendIcon />
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              ) : (
                <Paper className="fade-in" sx={{ backgroundColor: '#fff', borderRadius: 2, p: 4, textAlign: 'center', height: 700, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '2px solid #FEE2E2' }}>
                  <ForumIcon sx={{ fontSize: 80, color: '#DC2626', mb: 2 }} />
                  <Typography variant="h5" sx={{ color: '#1A1A2E', fontWeight: 600, mb: 2 }}>
                    Welcome to Inquiry & Chat
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#4B5563' }}>
                    Select an item from the list to view and send messages.
                  </Typography>
                </Paper>
              )}
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default Chat;
