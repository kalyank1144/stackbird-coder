import { motion, type Variants } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Dialog, DialogButton, DialogDescription, DialogRoot, DialogTitle } from '~/components/ui/Dialog';
import { ThemeSwitch } from '~/components/ui/ThemeSwitch';
import { ControlPanel } from '~/components/@settings/core/ControlPanel';
import { SettingsButton, HelpButton } from '~/components/ui/SettingsButton';
import { Button } from '~/components/ui/Button';
import { db, deleteById, getAll, chatId, type ChatHistoryItem, useChatHistory } from '~/lib/persistence';
import { cubicEasingFn } from '~/utils/easings';
import { HistoryItem } from './HistoryItem';
import { binDates } from './date-binning';
import { useSearchFilter } from '~/lib/hooks/useSearchFilter';
import { classNames } from '~/utils/classNames';
import { useStore } from '@nanostores/react';
import { profileStore } from '~/lib/stores/profile';
import { isAuthenticated } from '~/lib/stores/auth';

const menuVariants = {
  closed: {
    width: '72px',
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
  open: {
    width: '280px',
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
} satisfies Variants;

type DialogContent =
  | { type: 'delete'; item: ChatHistoryItem }
  | { type: 'bulkDelete'; items: ChatHistoryItem[] }
  | null;

export const Menu = () => {
  const { duplicateCurrentChat, exportChat } = useChatHistory();
  const menuRef = useRef<HTMLDivElement>(null);
  const [list, setList] = useState<ChatHistoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<DialogContent>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const profile = useStore(profileStore);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const isLoggedIn = useStore(isAuthenticated);

  const { filteredItems: filteredList, handleSearchChange } = useSearchFilter({
    items: list,
    searchFields: ['description'],
  });

  const loadEntries = useCallback(() => {
    if (db) {
      getAll(db)
        .then((list) => list.filter((item) => item.urlId && item.description))
        .then(setList)
        .catch((error) => toast.error(error.message));
    }
  }, []);

  const deleteChat = useCallback(
    async (id: string): Promise<void> => {
      if (!db) {
        throw new Error('Database not available');
      }

      // Delete chat snapshot from localStorage
      try {
        const snapshotKey = `snapshot:${id}`;
        localStorage.removeItem(snapshotKey);
        console.log('Removed snapshot for chat:', id);
      } catch (snapshotError) {
        console.error(`Error deleting snapshot for chat ${id}:`, snapshotError);
      }

      // Delete the chat from the database
      await deleteById(db, id);
      console.log('Successfully deleted chat:', id);
    },
    [db],
  );

  const deleteItem = useCallback(
    (event: React.UIEvent, item: ChatHistoryItem) => {
      event.preventDefault();
      event.stopPropagation();

      // Log the delete operation to help debugging
      console.log('Attempting to delete chat:', { id: item.id, description: item.description });

      deleteChat(item.id)
        .then(() => {
          toast.success('Chat deleted successfully', {
            position: 'bottom-right',
            autoClose: 3000,
          });

          // Always refresh the list
          loadEntries();

          if (chatId.get() === item.id) {
            // hard page navigation to clear the stores
            console.log('Navigating away from deleted chat');
            window.location.pathname = '/';
          }
        })
        .catch((error) => {
          console.error('Failed to delete chat:', error);
          toast.error('Failed to delete conversation', {
            position: 'bottom-right',
            autoClose: 3000,
          });

          // Still try to reload entries in case data has changed
          loadEntries();
        });
    },
    [loadEntries, deleteChat],
  );

  const deleteSelectedItems = useCallback(
    async (itemsToDeleteIds: string[]) => {
      if (!db || itemsToDeleteIds.length === 0) {
        console.log('Bulk delete skipped: No DB or no items to delete.');
        return;
      }

      console.log(`Starting bulk delete for ${itemsToDeleteIds.length} chats`, itemsToDeleteIds);

      let deletedCount = 0;
      const errors: string[] = [];
      const currentChatId = chatId.get();
      let shouldNavigate = false;

      // Process deletions sequentially using the shared deleteChat logic
      for (const id of itemsToDeleteIds) {
        try {
          await deleteChat(id);
          deletedCount++;

          if (id === currentChatId) {
            shouldNavigate = true;
          }
        } catch (error) {
          console.error(`Error deleting chat ${id}:`, error);
          errors.push(id);
        }
      }

      // Show appropriate toast message
      if (errors.length === 0) {
        toast.success(`${deletedCount} chat${deletedCount === 1 ? '' : 's'} deleted successfully`);
      } else {
        toast.warning(`Deleted ${deletedCount} of ${itemsToDeleteIds.length} chats. ${errors.length} failed.`, {
          autoClose: 5000,
        });
      }

      // Reload the list after all deletions
      await loadEntries();

      // Clear selection state
      setSelectedItems([]);
      setSelectionMode(false);

      // Navigate if needed
      if (shouldNavigate) {
        console.log('Navigating away from deleted chat');
        window.location.pathname = '/';
      }
    },
    [deleteChat, loadEntries, db],
  );

  const closeDialog = () => {
    setDialogContent(null);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);

    if (selectionMode) {
      // If turning selection mode OFF, clear selection
      setSelectedItems([]);
    }
  };

  const toggleItemSelection = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const newSelectedItems = prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id];
      console.log('Selected items updated:', newSelectedItems);

      return newSelectedItems; // Return the new array
    });
  }, []); // No dependencies needed

  const handleBulkDeleteClick = useCallback(() => {
    if (selectedItems.length === 0) {
      toast.info('Select at least one chat to delete');
      return;
    }

    const selectedChats = list.filter((item) => selectedItems.includes(item.id));

    if (selectedChats.length === 0) {
      toast.error('Could not find selected chats');
      return;
    }

    setDialogContent({ type: 'bulkDelete', items: selectedChats });
  }, [selectedItems, list]); // Keep list dependency

  const selectAll = useCallback(() => {
    const allFilteredIds = filteredList.map((item) => item.id);
    setSelectedItems((prev) => {
      const allFilteredAreSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => prev.includes(id));

      if (allFilteredAreSelected) {
        // Deselect only the filtered items
        const newSelectedItems = prev.filter((id) => !allFilteredIds.includes(id));
        console.log('Deselecting all filtered items. New selection:', newSelectedItems);

        return newSelectedItems;
      } else {
        // Select all filtered items, adding them to any existing selections
        const newSelectedItems = [...new Set([...prev, ...allFilteredIds])];
        console.log('Selecting all filtered items. New selection:', newSelectedItems);

        return newSelectedItems;
      }
    });
  }, [filteredList]); // Depends only on filteredList

  useEffect(() => {
    if (open) {
      loadEntries();
    }
  }, [open, loadEntries]);

  // Exit selection mode when sidebar is closed
  useEffect(() => {
    if (!open && selectionMode) {
      /*
       * Don't clear selection state anymore when sidebar closes
       * This allows the selection to persist when reopening the sidebar
       */
      console.log('Sidebar closed, preserving selection state');
    }
  }, [open, selectionMode]);

  // Sidebar toggle - no auto open/close on mouse movement
  const toggleSidebar = useCallback(() => {
    if (!isSettingsOpen) {
      setOpen((prev) => !prev);
    }
  }, [isSettingsOpen]);

  const handleDuplicate = async (id: string) => {
    await duplicateCurrentChat(id);
    loadEntries(); // Reload the list after duplication
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
    setOpen(false);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  const setDialogContentWithLogging = useCallback((content: DialogContent) => {
    console.log('Setting dialog content:', content);
    setDialogContent(content);
  }, []);

  // Don't render sidebar if user is not logged in
  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      {/* Modern Fixed Sidebar */}
      <motion.div
        ref={menuRef}
        initial="closed"
        animate={open ? 'open' : 'closed'}
        variants={menuVariants}
        className={classNames(
          'flex selection-accent flex-col side-menu fixed top-0 left-0 h-full',
          'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950',
          'border-r border-slate-800/50 shadow-xl text-sm overflow-hidden',
          isSettingsOpen ? 'z-40' : 'z-sidebar',
        )}
      >
        {/* Logo & Toggle Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
            >
              <span className="i-ph:bird-fill text-xl" />
            </button>
            {open && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
              >
                stackbird
              </motion.span>
            )}
          </div>
          {open && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={toggleSidebar}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <span className="i-ph:caret-left text-lg" />
            </motion.button>
          )}
        </div>

        {/* User Profile Section */}
        <div className={classNames('px-3 py-4 border-b border-slate-800/50', !open && 'flex justify-center')}>
          {open ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 backdrop-blur">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shrink-0">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt={profile?.username || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span className="i-ph:user-fill text-white text-lg" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{profile?.username || 'Guest User'}</p>
                <p className="text-xs text-slate-400">{new Date().toLocaleDateString()}</p>
              </div>
              <HelpButton onClick={() => window.open('https://stackblitz-labs.github.io/stackbird.new/', '_blank')} />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
              {profile?.avatar ? (
                <img src={profile.avatar} alt={profile?.username || 'User'} className="w-full h-full object-cover" />
              ) : (
                <span className="i-ph:user-fill text-white text-lg" />
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className={classNames('px-3 py-3 space-y-2', !open && 'flex flex-col items-center')}>
          <a
            href="/"
            className={classNames(
              'flex items-center gap-3 rounded-xl transition-all',
              open
                ? 'w-full px-4 py-3 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 border border-purple-500/30'
                : 'w-10 h-10 justify-center bg-slate-800 hover:bg-slate-700',
            )}
          >
            <span className="i-ph:plus-circle-fill text-lg text-purple-400" />
            {open && <span className="text-sm font-medium text-white">New Chat</span>}
          </a>
          <button
            onClick={toggleSelectionMode}
            className={classNames(
              'flex items-center gap-3 rounded-xl transition-all',
              selectionMode
                ? 'bg-purple-500 text-white'
                : open
                  ? 'w-full px-4 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300'
                  : 'w-10 h-10 justify-center bg-slate-800 hover:bg-slate-700 text-slate-300',
              open ? '' : 'w-10 h-10 justify-center',
            )}
          >
            <span className={selectionMode ? 'i-ph:x text-lg' : 'i-ph:check-square text-lg'} />
            {open && <span className="text-sm">{selectionMode ? 'Cancel' : 'Select'}</span>}
          </button>
        </div>

        {/* Search */}
        {open && (
          <div className="px-3 pb-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 i-ph:magnifying-glass text-slate-500" />
              <input
                type="search"
                placeholder="Search conversations..."
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent text-sm"
              />
            </div>
          </div>
        )}

        {/* Chats List Header */}
        <div className={classNames('px-4 py-2 flex items-center justify-between', !open && 'hidden')}>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Conversations</span>
          {selectionMode && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs text-slate-400 hover:text-white">
                {selectedItems.length === filteredList.length ? 'Deselect' : 'All'}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDeleteClick}
                disabled={selectedItems.length === 0}
                className="text-xs"
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Chats List */}
        <div className={classNames('flex-1 overflow-auto px-3 pb-3', !open && 'hidden')}>
          {filteredList.length === 0 && (
            <div className="px-4 py-8 text-center">
              <span className="i-ph:chat-circle-dots text-4xl text-slate-700 mb-2 block" />
              <p className="text-sm text-slate-500">
                {list.length === 0 ? 'No conversations yet' : 'No matches found'}
              </p>
            </div>
          )}
          <DialogRoot open={dialogContent !== null}>
            {binDates(filteredList).map(({ category, items }) => (
              <div key={category} className="mt-3 first:mt-0">
                <div className="text-xs font-medium text-slate-500 sticky top-0 z-1 bg-slate-900/95 backdrop-blur px-2 py-1.5 rounded-lg mb-1">
                  {category}
                </div>
                <div className="space-y-1">
                  {items.map((item) => (
                    <HistoryItem
                      key={item.id}
                      item={item}
                      exportChat={exportChat}
                      onDelete={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        console.log('Delete triggered for item:', item);
                        setDialogContentWithLogging({ type: 'delete', item });
                      }}
                      onDuplicate={() => handleDuplicate(item.id)}
                      selectionMode={selectionMode}
                      isSelected={selectedItems.includes(item.id)}
                      onToggleSelection={toggleItemSelection}
                    />
                  ))}
                </div>
              </div>
            ))}
            <Dialog onBackdrop={closeDialog} onClose={closeDialog}>
              {dialogContent?.type === 'delete' && (
                <>
                  <div className="p-6 bg-slate-900">
                    <DialogTitle className="text-white flex items-center gap-2">
                      <span className="i-ph:trash text-red-400" />
                      Delete Chat?
                    </DialogTitle>
                    <DialogDescription className="mt-3 text-slate-400">
                      <p>
                        You are about to delete{' '}
                        <span className="font-medium text-white">{dialogContent.item.description}</span>
                      </p>
                      <p className="mt-2">Are you sure you want to delete this chat?</p>
                    </DialogDescription>
                  </div>
                  <div className="flex justify-end gap-3 px-6 py-4 bg-slate-950 border-t border-slate-800">
                    <DialogButton type="secondary" onClick={closeDialog}>
                      Cancel
                    </DialogButton>
                    <DialogButton
                      type="danger"
                      onClick={(event) => {
                        console.log('Dialog delete button clicked for item:', dialogContent.item);
                        deleteItem(event, dialogContent.item);
                        closeDialog();
                      }}
                    >
                      Delete
                    </DialogButton>
                  </div>
                </>
              )}
              {dialogContent?.type === 'bulkDelete' && (
                <>
                  <div className="p-6 bg-slate-900">
                    <DialogTitle className="text-white flex items-center gap-2">
                      <span className="i-ph:trash text-red-400" />
                      Delete Selected Chats?
                    </DialogTitle>
                    <DialogDescription className="mt-3 text-slate-400">
                      <p>
                        You are about to delete {dialogContent.items.length}{' '}
                        {dialogContent.items.length === 1 ? 'chat' : 'chats'}:
                      </p>
                      <div className="mt-3 max-h-32 overflow-auto border border-slate-700 rounded-xl bg-slate-800/50 p-3">
                        <ul className="space-y-1.5">
                          {dialogContent.items.map((item) => (
                            <li key={item.id} className="text-sm flex items-center gap-2">
                              <span className="i-ph:chat-circle text-slate-500" />
                              <span className="font-medium text-white">{item.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="mt-3">Are you sure you want to delete these chats?</p>
                    </DialogDescription>
                  </div>
                  <div className="flex justify-end gap-3 px-6 py-4 bg-slate-950 border-t border-slate-800">
                    <DialogButton type="secondary" onClick={closeDialog}>
                      Cancel
                    </DialogButton>
                    <DialogButton
                      type="danger"
                      onClick={() => {
                        const itemsToDeleteNow = [...selectedItems];
                        console.log('Bulk delete confirmed for', itemsToDeleteNow.length, 'items', itemsToDeleteNow);
                        deleteSelectedItems(itemsToDeleteNow);
                        closeDialog();
                      }}
                    >
                      Delete
                    </DialogButton>
                  </div>
                </>
              )}
            </Dialog>
          </DialogRoot>
        </div>

        {/* Bottom Actions */}
        <div
          className={classNames(
            'mt-auto border-t border-slate-800/50 px-3 py-3',
            !open && 'flex flex-col items-center gap-2',
          )}
        >
          {open ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SettingsButton onClick={handleSettingsClick} />
                <ThemeSwitch />
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={handleSettingsClick}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <span className="i-ph:gear text-lg" />
              </button>
              <ThemeSwitch />
            </>
          )}
        </div>
      </motion.div>

      <ControlPanel open={isSettingsOpen} onClose={handleSettingsClose} />
    </>
  );
};
