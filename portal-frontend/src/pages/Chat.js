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

  // (no debug logging in production)

  // IMPORTANT:
  // - Only fetch on item switch
  // - Never clear messages on "loading"
  // - Use optimistic append on send, and do NOT re-fetch after POST
  //   to prevent GET responses overwriting the UI and causing flash/vanish.
  const lastSelectedItemIdRef = useRef(null);
  const fetchSeqRef = useRef(0);

  useEffect(() => {
    // Do NOT clear messages when selectedItemId is temporarily null.
    // Clearing here is what causes the brief vanish.
    if (selectedItemId == null) {
      lastSelectedItemIdRef.current = null;
      return;
    }

    if (lastSelectedItemIdRef.current !== selectedItemId) {
      lastSelectedItemIdRef.current = selectedItemId;
      setLoadingMessages(true);

      // Request token: only apply the latest GET result.
      const fetchSeq = ++fetchSeqRef.current;

      messageService
        .getMessages(selectedItemId)
        .then((response) => {
          // Drop stale GET responses that resolve out of order.
          if (fetchSeq !== fetchSeqRef.current) return;

          // Keep your existing POST guard.
          if (!isPostingRef.current) {
            setMessages(response.data);
          }
        })
        .catch((err) => {
          // Drop stale errors too
          if (fetchSeq !== fetchSeqRef.current) return;

          console.error('Failed to load messages.');
        })
        .finally(() => {
          if (fetchSeq !== fetchSeqRef.current) return;
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

  const isPostingRef = useRef(false);

  const handleSendMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !selectedItem || sendingMessage) return;

    isPostingRef.current = true;
    setSendingMessage(true);
    setJustSentMessageId(null);

    // MUST mirror JSX renderer keys exactly:
    // - message.content
    // - message.User.studentId
    // - message.User.displayName
    // - message.timestamp
    // - message.id (used as key)
    const tempId = Date.now().toString();
    const nowIso = new Date().toISOString();

    const optimisticMsg = {
      id: tempId,
      content: trimmed,
      itemId: selectedItem.id,
      timestamp: nowIso,
      User: {
        studentId: user?.studentId,
        displayName: user?.displayName
      }
    };

    // Append using functional update
    setMessages((prev) => {
      const next = [...prev, optimisticMsg];
      return next;
    });

    // 3) Clear input ONLY after state append call above
    setNewMessage('');

    try {
      // 4) POST to backend
      const response = await messageService.createMessage({
        content: trimmed,
        itemId: selectedItem.id
      });

      const created = response?.data;

      // 5) Compare backend response key structure vs JSX expectations
      console.log('🧩 Backend POST response data:', created);
      if (created) {
        console.log('🧩 Backend fields for JSX:', {
          id: created?.id,
          content: created?.content,
          timestamp: created?.timestamp,
          studentId: created?.User?.studentId,
          displayName: created?.User?.displayName,

          // also log if backend used different key names (common mismatch checks)
          possible_alt_content_keys: {
            text: created?.text,
            message_text: created?.message_text,
            body: created?.body,
            message: created?.message
          }
        });
      }

      if (!created || created.id == null) return;

      // 6) Replace optimistic with server response and log after replace
      setMessages((prev) => {
        const next = prev.map((m) => (m.id === tempId ? created : m));

        console.log('🟩 State Array Content (after optimistic -> server replace):', next);
        console.log(
          '🧾 Render-loop keys snapshot (after replace):',
          next.map((m) => ({
            id: m?.id,
            content: m?.content,
            timestamp: m?.timestamp,
            studentId: m?.User?.studentId,
            displayName: m?.User?.displayName
          }))
        );

        return next;
      });

      setJustSentMessageId(created.id ?? null);
    } catch (err) {
      // Revert optimistic on failure
      console.log('🛑 Send failed, reverting optimistic tempId:', tempId);
      setMessages((prev) => {
        const next = prev.filter((m) => m.id !== tempId);

        console.log('🧯 State Array Content (after revert):', next);
        return next;
      });

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

      // Immediate local state sync (no refresh needed)
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
                          sx={{ mb: 3, opacity: 1, display: 'block' }}
                        >

                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <Avatar sx={{ backgroundColor: '#DC2626', mr: 2, width: 40, height: 40, fontWeight: 700 }}>
                              {message.User?.studentId?.charAt(0) || '?'}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="subtitle1" sx={{ color: '#1A1A2E', fontWeight: 700, mr: 1 }}>
                                  {message.User?.displayName || user?.displayName || 'Unknown'}
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
