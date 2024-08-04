'use client';
import Image from "next/image";
import { useState, useEffect } from "react";
import { Box, Modal, Stack, TextField, Typography, Button, Pagination, Snackbar, Alert, CircularProgress } from "@mui/material";
import { firestore } from "@/firebase";
import { collection, deleteDoc, doc, getDocs, query, setDoc, getDoc } from "firebase/firestore";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}


export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 4;

  const updateInventory = async () => {
    setLoading(true);
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
    setLoading(false);
  };

  const addItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    let updatedInventory = [...inventory];
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data();
      await setDoc(docRef, { quantity: existingQuantity + quantity });
      updatedInventory = updatedInventory.map(invItem =>
        invItem.name === item ? { ...invItem, quantity: existingQuantity + quantity } : invItem
      );
    } else {
      await setDoc(docRef, { quantity });
      updatedInventory.push({ name: item, quantity });
    }
    setInventory(updatedInventory);
    showSnackbar('Item added successfully!');
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      let updatedInventory = [...inventory];
      if (quantity <= 1) {
        await deleteDoc(docRef);
        updatedInventory = updatedInventory.filter(invItem => invItem.name !== item);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
        updatedInventory = updatedInventory.map(invItem =>
          invItem.name === item ? { ...invItem, quantity: quantity - 1 } : invItem
        );
      }
      setInventory(updatedInventory);
      showSnackbar('Item removed successfully!');
    }
  };

  const updateItemQuantity = async (item, quantity) => {
    if (quantity < 1) return;
    const docRef = doc(collection(firestore, 'inventory'), item);
    await setDoc(docRef, { quantity });
    const updatedInventory = inventory.map(invItem =>
      invItem.name === item ? { ...invItem, quantity } : invItem
    );
    setInventory(updatedInventory);
    showSnackbar('Item quantity updated successfully!');
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedInventory = filteredInventory.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Box
      width="100%"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={2}
      padding={2}
      bgcolor="#f4f6f8"
    >
      <Modal
        open={open}
        onClose={handleClose}
      >
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width="90%"
          maxWidth={400}
          bgcolor="white"
          borderRadius={2}
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%,-50%)",
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack
            width="100%"
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            flexWrap="wrap"
          >
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Item name"
              sx={{ flex: 1 }}
            />
            <TextField
              variant="outlined"
              type="number"
              fullWidth
              value={itemQuantity}
              onChange={(e) => setItemQuantity(parseInt(e.target.value, 10))}
              placeholder="Quantity"
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              onClick={() => {
                addItem(itemName, itemQuantity);
                setItemName('');
                setItemQuantity(1);
                handleClose();
              }}
              disabled={!itemName}
              sx={{ flexShrink: 0 }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{ mb: 2 }}
      >
        Add New Item
      </Button>
      <Box width="100%" maxWidth="800px">
        <TextField
          variant="outlined"
          placeholder="Search items"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          sx={{ marginBottom: 2 }}
        />
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box
          border="1px solid #333"
          bgcolor="white"
          borderRadius={2}
          p={2}
          boxShadow={3}
          width="100%"
          maxWidth="800px"
          height="500px"
          overflow="auto"
        >
          <Box
            width="100%"
            height="80px"
            bgcolor="#84ACCE"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius={1}
            mb={2}
          >
            <Typography variant="h2" color="#333" textAlign="center">
              My Pantry
            </Typography>
          </Box>
          <Stack spacing={2} overflow="auto">
            {paginatedInventory.length === 0 ? (
              <Typography variant="h5" color="#333" textAlign="center">
                No items in the pantry.
              </Typography>
            ) : (
              paginatedInventory.map(({ name, quantity }) => (
                <Box
                  key={name}
                  bgcolor="#f0f0f0"
                  borderRadius={1}
                  p={2}
                  mb={2}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={2}
                >
                  <Typography variant="h5" color="#333" sx={{ flex: 1 }}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <TextField
                    variant="outlined"
                    type="number"
                    value={quantity}
                    onChange={(e) => updateItemQuantity(name, parseInt(e.target.value, 10))}
                    inputProps={{ style: { textAlign: 'center' } }}
                    size="small"
                    sx={{ width: 60 }}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" onClick={() => addItem(name, 1)}>
                      Add
                    </Button>
                    <Button variant="contained" onClick={() => removeItem(name)}>
                      Remove
                    </Button>
                  </Stack>
                </Box>
              ))
            )}
          </Stack>
          <Pagination
            count={Math.ceil(filteredInventory.length / itemsPerPage)}
            page={page}
            onChange={handlePageChange}
            sx={{ marginTop: 2, alignSelf: 'center' }}
          />
        </Box>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
