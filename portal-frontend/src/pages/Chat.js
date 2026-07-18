import React, { useState, useEffect, useRef } from 'react';

import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  IconButton,
  Paper,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
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
  const [isItemsLoading, setIsItemsLoading] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-select item from URL parameter
  useEffect(() => {
    if (items.length > 0) {
      const itemIdFromUrl = searchParams.get('itemId');
      if (itemIdFromUrl) {
        const item = items.find((i) => i.id === parseInt(itemIdFromUrl));
        if (item) setSelectedItem(item);
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
  const fetchSeqRef = useRef(0);

  const isPostingRef = useRef(false);

  useEffect(() => {
    // Do NOT clear messages when selectedItemId is temporarily null.
    if (selectedItemId == null) {
      lastSelectedItemIdRef.current = null;
      return;
    }

    if (lastSelectedItemIdRef.current !== selectedItemId) {
      lastSelectedItemIdRef.current = selectedItemId;
      setIsMessagesLoading(true);

      // Request token: only apply the latest GET result.
      const fetchSeq = ++fetchSeqRef.current;

      messageService
        .getMessages(selectedItemId)
        .then((response) => {
          if (fetchSeq !== fetchSeqRef.current) return;

          if (!isPostingRef.current) {
            setMessages(response.data);
          }
        })
        .catch((err) => {
          if (fetchSeq !== fetchSeqRef.current) return;
          console.error('Failed to load messages.');
        })
        .finally(() => {
          if (fetchSeq !== fetchSeqRef.current) return;
          setIsMessagesLoading(false);
        });
    }
  }, [selectedItemId]);

  // Auto-scroll to bottom when messages are loaded/updated or item is clicked
  useEffect(() => {
    if (!messagesEndRef.current) return;
    const t = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 0);
    return () => clearTimeout(t);
  }, [messages, selectedItemId, isMessagesLoading]);

  const loadItems = async () => {
    setIsItemsLoading(true);
    try {
      const response = await itemService.getItems();
      setItems(response.data);
    } catch (err) {
      console.error('Failed to load items');
    } finally {
      setIsItemsLoading(false);
    }
  };

  const [sendingMessage, setSendingMessage] = useState(false);
  const [justSentMessageId, setJustSentMessageId] = useState(null);

  const handleSendMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !selectedItem || sendingMessage) return;

    isPostingRef.current = true;
    setSendingMessage(true);
    setJustSentMessageId(null);

    const tempId = Date.now().toString();
    const nowIso = new Date().toISOString();

    const optimisticMsg = {
      id: tempId,
      content: trimmed,
      itemId: selectedItem.id,
      timestamp: nowIso,
      User: {
        studentId: user?.studentId,
        displayName: user?.displayName,
      },
    };

    setMessages((prev) => {
      const next = [...prev, optimisticMsg];
      return next;
    });

    setNewMessage('');

    try {
      const response = await messageService.createMessage({
        content: trimmed,
        itemId: selectedItem.id,
      });

      const created = response?.data;

      // Replace optimistic with server response
      if (created && created.id != null) {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? created : m)));
        setJustSentMessageId(created.id ?? null);
      }
    } catch (err) {
      // Revert optimistic on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      console.error('Failed to send message:', err.response?.data || err.message);
      alert(`Failed to send message. ${err.response?.data?.message || err.message}`);
    } finally {
      isPostingRef.current = false;
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (user.role !== 'admin') return;
    try {
      await messageService.deleteMessage(messageId);
      setMessages((current) => current.filter((msg) => msg.id !== messageId));
    } catch (err) {
      console.error('Failed to delete message:', err?.response?.data || err.message);
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
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
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
              <Paper
                className="card-hover fade-in"
                sx={(theme) => ({
                  borderRadius: 2,
                  overflow: 'hidden',
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                })}
              >
                <Box sx={{ p: 2, backgroundColor: '#DC2626', borderBottom: '2px solid #B91C1C' }}>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                    <SearchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Items
                  </Typography>
                </Box>

                <List
                  sx={(theme) => ({
                    maxHeight: 600,
                    overflow: 'auto',
                    bgcolor: theme.palette.background.paper,
                  })}
                >
                  {isItemsLoading ? (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 240,
                        gap: 2,
                        px: 2,
                      }}
                    >
                      <CircularProgress size={32} sx={{ color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Fetching items...
                      </Typography>
                    </Box>
                  ) : (
                    items.map((item, index) => (
                      <React.Fragment key={item.id}>
                        <ListItem
                          button
                          onClick={() => setSelectedItem(item)}
                          className={`card-hover fade-in stagger-${Math.min(index + 1, 4)}`}
                          sx={(theme) => ({
                            backgroundColor:
                              selectedItem?.id === item.id
                                ? theme.palette.action.selected
                                : 'transparent',
                            '&:hover': { backgroundColor: theme.palette.action.hover },
                            py: 2,
                            cursor: 'pointer',
                          })}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ backgroundColor: '#DC2626', fontWeight: 700 }}>
                              {item.title.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                {item.title}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {item.category} • {item.location}
                              </Typography>
                            }
                          />
                        </ListItem>
                        <Divider sx={{ backgroundColor: 'divider' }} />
                      </React.Fragment>
                    ))
                  )}
                </List>
              </Paper>
            </Grid>
          )}

          {/* Chat Area (hide entire right panel on mobile when no chat is selected) */}
          {(!isMobile || selectedItem) && (
            <Grid item xs={12} md={8}>
              {selectedItem ? (
                <Paper
                  className="card-hover fade-in"
                  sx={(theme) => ({
                    borderRadius: 2,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: 700,
                    border: '1px solid',
                    borderColor:
                      theme.palette.mode === 'dark' ? theme.palette.divider : '#FEE2E2',
                  })}
                >
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
                  <Box
                    sx={(theme) => ({
                      flexGrow: 1,
                      overflow: 'auto',
                      p: 2,
                      backgroundColor: theme.palette.background.default,
                    })}
                  >
                    {isMessagesLoading ? (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          gap: 2,
                        }}
                      >
                        <CircularProgress size={40} sx={{ color: 'primary.main' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                          Fetching conversation data...
                        </Typography>
                      </Box>
                    ) : messages.length === 0 ? (
                      <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Typography variant="body1" sx={{ color: 'text.primary' }}>
                          No messages yet. Start the conversation!
                        </Typography>
                      </Box>
                    ) : (
                      messages.map((message, index) => (
                        <Box key={message.id || index} sx={{ mb: 3, opacity: 1, display: 'block' }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <Avatar
                              sx={{
                                backgroundColor: '#DC2626',
                                mr: 2,
                                width: 40,
                                height: 40,
                                fontWeight: 700,
                              }}
                            >
                              {(message.User?.displayName?.trim()?.charAt(0) ||
                                '?').toUpperCase()}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 700, mr: 1 }}>
                                  {message.User?.displayName || user?.displayName || 'Unknown'}
                                </Typography>

                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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

                              <Typography
                                variant="body1"
                                sx={{
                                  color: 'text.primary',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                }}
                              >
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
                  <Box
                    sx={(theme) => ({
                      p: 2,
                      backgroundColor: 'background.paper',
                      borderTop: '2px solid',
                      borderColor: 'primary.main',
                    })}
                  >
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        placeholder={sendingMessage ? 'Sending...' : `Message about ${selectedItem.title}...`}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        variant="outlined"
                        size="small"
                        disabled={sendingMessage}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'background.paper',
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'text.secondary' },
                            '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                          },
                          '& .MuiInputBase-input': {
                            color: 'text.primary !important',
                            '-webkit-text-fill-color': 'text.primary !important',
                          },
                          '& .MuiInputBase-input::placeholder': {
                            color: 'text.secondary !important',
                            opacity: 1,
                          },
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
                <Paper
                  className="fade-in"
                  sx={{
                    backgroundColor: (theme) => theme.palette.background.default,
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    height: 700,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '1px solid',
                    borderColor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.divider : '#FEE2E2'),
                  }}
                >
                  <ForumIcon sx={{ fontSize: 80, color: '#DC2626', mb: 2 }} />
                  <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 600, mb: 2 }}>
                    Welcome to Inquiry & Chat
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
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

