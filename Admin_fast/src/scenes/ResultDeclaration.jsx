import { Box, Button, Typography, useTheme, TextField, MenuItem, Select, FormControl, InputLabel, CircularProgress, Snackbar, Alert, Tabs, Tab, Paper, Divider, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
import Header from "../components/Header";
import { useState, useEffect } from "react";
import axios from "axios";
import "./payment.css";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfoIcon from "@mui/icons-material/Info";

const ResultDeclaration = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // State variables
  const [matches, setMatches] = useState([]);
  const [fancyMarkets, setFancyMarkets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedMatch, setSelectedMatch] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("");
  const [resultValue, setResultValue] = useState("");
  const [resultType, setResultType] = useState("win"); // win, lose, cancel
  const [recentDeclarations, setRecentDeclarations] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null
  });
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    bet: null
  });

  // Fetch recent declarations
  const fetchRecentDeclarations = async () => {
    try {
      setLoading(true);
      console.log("Base URL:", process.env.REACT_APP_BASE_URL);
      
      let response;
      let success = false;
      
      // Try the new dedicated endpoint first
      try {
        console.log("Trying new recent-declarations endpoint...");
        response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/admin/recent-declarations`);
        success = response.data.success;
      } catch (error) {
        console.error("Error with new endpoint, falling back to old endpoint:", error);
        console.log("Error details:", error.message, error.response?.status, error.response?.data);
        
        // Fall back to the old endpoint
        try {
          response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/admin/cricketmarket/allbetsupdate`);
          success = response.data.success;
        } catch (fallbackError) {
          console.error("Error with fallback endpoint:", fallbackError);
          console.log("Fallback error details:", fallbackError.message, fallbackError.response?.status, fallbackError.response?.data);
          throw fallbackError; // Re-throw to be caught by the outer catch
        }
      }
      
      if (success) {
        // Map the data to the format expected by the DataGrid
        const settledBets = (response.data.data || [])
          .filter(bet => bet.result && bet.status !== "Pending") // Ensure we only get settled bets
          .map((bet, index) => ({
            id: index,
            _id: bet._id,
            match: bet.match || "Unknown Match",
            label: bet.label || "Unknown Market",
            type: bet.type || "Unknown Type",
            result: bet.result || "Unknown Result",
            status: bet.status || "Unknown Status",
            stake: bet.stake || "0",
            profit: bet.profit || "0",
            odds: bet.odds || "0",
            run: bet.run || "N/A",
            createdAt: new Date(bet.createdAt).toLocaleString(),
          }));
        
        console.log("Recent declarations fetched:", settledBets.length);
        setRecentDeclarations(settledBets);
      } else {
        console.error("Failed to fetch recent declarations:", response.data);
        showSnackbar("Failed to fetch recent declarations", "error");
      }
    } catch (error) {
      console.error("Error fetching recent declarations:", error);
      showSnackbar(`Failed to fetch recent declarations: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch matches on component mount
  useEffect(() => {
    fetchMatches();
    fetchRecentDeclarations();
  }, []);

  // Fetch fancy markets when selected match changes
  useEffect(() => {
    if (tabValue === 1) { // Only fetch fancy markets when on the Fancy tab
      fetchFancyMarkets();
    }
  }, [selectedMatch, tabValue]);

  // Fetch all cricket matches
  const fetchMatches = async () => {
    setLoading(true);
    try {
      console.log("Fetching matches from:", `${process.env.REACT_APP_BASE_URL}/cricket/matches`);
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/cricket/matches`);
      
      if (response.data.success) {
        // Separate live and finished matches
        const allMatches = response.data.matches || [];
        console.log("Matches fetched:", allMatches.length);
        
        // Sort matches - live matches first, then finished
        allMatches.sort((a, b) => {
          // If matches have status property (new API format)
          if (a.status && b.status) {
            if (a.status === 'live' && b.status !== 'live') return -1;
            if (a.status !== 'live' && b.status === 'live') return 1;
            return a.match.localeCompare(b.match);
          }
          // Fallback to simple string comparison if no status
          return a.localeCompare(b);
        });
        
        setMatches(allMatches);
      } else {
        console.error("Failed to fetch matches:", response.data);
        showSnackbar("Failed to fetch matches: " + (response.data.message || "Unknown error"), "error");
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
      console.log("Error details:", error.message, error.response?.status, error.response?.data);
      showSnackbar(`Failed to fetch matches: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch fancy markets
  const fetchFancyMarkets = async () => {
    if (!selectedMatch) {
      setFancyMarkets([]);
      return;
    }
    
    // Extract match name from the selected match object
    const matchName = typeof selectedMatch === 'object' ? selectedMatch.match : selectedMatch;
    
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/cricket/fancy-markets/${matchName}`);
      if (response.data.success) {
        // Convert the array of market objects or strings to a consistent format
        const marketsWithIds = (response.data.markets || []).map((market, index) => {
          // Handle both object format and string format
          if (typeof market === 'object') {
            return {
              _id: index.toString(),
              name: market.market,
              label: market.market,
              status: market.status || 'live'
            };
          } else {
            return {
              _id: index.toString(),
              name: market,
              label: market,
              status: 'live' // Default status
            };
          }
        });
        
        // Sort markets - live markets first, then finished
        marketsWithIds.sort((a, b) => {
          if (a.status === 'live' && b.status !== 'live') return -1;
          if (a.status !== 'live' && b.status === 'live') return 1;
          return a.name.localeCompare(b.name);
        });
        
        setFancyMarkets(marketsWithIds);
      }
    } catch (error) {
      console.error("Error fetching fancy markets:", error);
      showSnackbar("Failed to fetch fancy markets", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Reset form values when changing tabs
    setSelectedMatch("");
    setSelectedMarket("");
    setResultValue("");
    setResultType("win");
  };

  // Show snackbar notification
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  // Open confirmation dialog
  const openConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm
    });
  };

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialog({
      ...confirmDialog,
      open: false
    });
  };

  // Handle match result declaration with confirmation
  const handleDeclareMatchResult = () => {
    if (!selectedMatch || (resultType !== "cancel" && !resultValue)) {
      showSnackbar("Please select a match and enter a result (if not cancelling)", "error");
      return;
    }

    const resultTypeText = resultType === "win" ? "win" : (resultType === "lose" ? "lose" : "cancel");
    const resultValueText = resultType === "cancel" ? "cancelled" : resultValue;

    openConfirmDialog(
      "Confirm Match Result Declaration",
      `Are you sure you want to declare the result for match "${selectedMatch}" as ${resultTypeText} ${resultType !== "cancel" ? `with value "${resultValueText}"` : ""}? This will affect all pending bets for this match.`,
      declareMatchResult
    );
  };

  // Handle fancy result declaration with confirmation
  const handleDeclareFancyResult = () => {
    if (!selectedMatch || !selectedMarket || (resultType !== "cancel" && resultValue === "")) {
      showSnackbar("Please select a match, market, and enter a result value (if not cancelling)", "error");
      return;
    }

    const resultTypeText = resultType === "win" ? "win" : (resultType === "lose" ? "lose" : "cancel");
    const resultValueText = resultType === "cancel" ? "cancelled" : resultValue;

    openConfirmDialog(
      "Confirm Fancy Market Result Declaration",
      `Are you sure you want to declare the result for market "${selectedMarket}" in match "${selectedMatch}" as ${resultTypeText} ${resultType !== "cancel" ? `with value "${resultValueText}"` : ""}? This will affect all pending bets for this market.`,
      declareFancyResult
    );
  };

  // Handle result reversion with confirmation
  const handleRevertResult = () => {
    if (!selectedMatch) {
      showSnackbar("Please select a match", "error");
      return;
    }

    if (tabValue === 1 && !selectedMarket) {
      showSnackbar("Please select a market for fancy result reversion", "error");
      return;
    }

    const marketText = tabValue === 1 ? ` for market "${selectedMarket}"` : "";

    openConfirmDialog(
      "Confirm Result Reversion",
      `Are you sure you want to revert the result for match "${selectedMatch}"${marketText}? This will reset all settled bets back to pending status and adjust user wallets accordingly.`,
      revertResult
    );
  };

  // Declare result for match odds (Lagaai/Khaai)
  const declareMatchResult = async () => {
    closeConfirmDialog();
    setLoading(true);
    
    // Extract match name from the selected match object
    const matchName = typeof selectedMatch === 'object' ? selectedMatch.match : selectedMatch;
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/cricket/update-result`, {
        match: matchName,
        label: resultValue, // For match odds, the label is the team name
        result: resultValue,
        type: resultType === "cancel" ? "cancel" : "win"
      });
      
      if (response.data.success) {
        showSnackbar(`Match result declared successfully! Processed ${response.data.processedCount || 0} bets.`);
        // Reset form values
        setResultValue("");
        // Refresh data
        fetchMatches();
        fetchRecentDeclarations();
      } else {
        showSnackbar(response.data.message || "Failed to declare result", "error");
      }
    } catch (error) {
      console.error("Error declaring match result:", error);
      showSnackbar(error.response?.data?.message || "Failed to declare result", "error");
    } finally {
      setLoading(false);
    }
  };

  // Declare result for fancy markets (YES/NO)
  const declareFancyResult = async () => {
    closeConfirmDialog();
    setLoading(true);
    
    // Extract match and market names from the selected objects
    const matchName = typeof selectedMatch === 'object' ? selectedMatch.match : selectedMatch;
    const marketName = typeof selectedMarket === 'object' ? selectedMarket.name : selectedMarket;
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/cricket/update-fancy-result`, {
        match: matchName,
        market: marketName,
        result: resultValue,
        type: resultType === "cancel" ? "cancel" : "win"
      });
      
      if (response.data.success) {
        showSnackbar(`Fancy market result declared successfully! Processed ${response.data.processedCount || 0} bets.`);
        // Reset form values
        setResultValue("");
        // Refresh data
        fetchFancyMarkets();
        fetchRecentDeclarations();
      } else {
        showSnackbar(response.data.message || "Failed to declare fancy result", "error");
      }
    } catch (error) {
      console.error("Error declaring fancy result:", error);
      showSnackbar(error.response?.data?.message || "Failed to declare fancy result", "error");
    } finally {
      setLoading(false);
    }
  };

  // Revert a declared result
  const revertResult = async () => {
    if (!selectedMatch) {
      showSnackbar("Please select a match", "error");
      return;
    }

    const marketInfo = tabValue === 0 ? "" : selectedMarket;
    if (tabValue === 1 && !marketInfo) {
      showSnackbar("Please select a market for fancy result reversion", "error");
      return;
    }
    
    setLoading(true);
    try {
      // Log the request details for debugging
      console.log("Reverting result with params:", {
        match: selectedMatch,
        market: marketInfo,
        type: tabValue === 0 ? "match" : "fancy"
      });
      
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/cricket/revert-result`, {
        match: selectedMatch,
        market: marketInfo,
        type: tabValue === 0 ? "match" : "fancy"
      });

      if (response.data.success) {
        showSnackbar("Result reverted successfully!");
        // Reset form
        setSelectedMatch("");
        setSelectedMarket("");
        setResultValue("");
        setResultType("win");
        
        // Explicitly fetch recent declarations after successful reversion
        await fetchRecentDeclarations();
      } else {
        showSnackbar(response.data.message || "Failed to revert result", "error");
      }
    } catch (error) {
      console.error("Error reverting result:", error);
      // More detailed error logging
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        showSnackbar(`Failed to revert result: ${error.response.data.message || error.response.status}`, "error");
      } else if (error.request) {
        console.error("No response received:", error.request);
        showSnackbar("Failed to revert result: No response from server", "error");
      } else {
        showSnackbar(`Failed to revert result: ${error.message}`, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to open detailed view
  const openDetailDialog = (bet) => {
    setDetailDialog({
      open: true,
      bet
    });
  };

  // Function to close detailed view
  const closeDetailDialog = () => {
    setDetailDialog({
      ...detailDialog,
      open: false
    });
  };

  // Define columns for the DataGrid
  const columns = [
    { field: 'match', headerName: 'Match', flex: 1 },
    { field: 'label', headerName: 'Market', flex: 1 },
    { 
      field: 'type', 
      headerName: 'Bet Type', 
      flex: 0.7,
      renderCell: (params) => {
        const betType = params.value;
        let color;
        
        if (betType === "YES" || betType === "Lgaai") {
          color = colors.greenAccent[500];
        } else if (betType === "NO" || betType === "Khaai" || betType === "khaai") {
          color = colors.redAccent[500];
        } else {
          color = colors.grey[500];
        }
        
        return (
          <Box
            sx={{
              color: color,
              fontWeight: "bold"
            }}
          >
            {betType}
          </Box>
        );
      }
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 0.7,
      renderCell: (params) => {
        const status = params.value;
        let color;
        
        if (status === "Won") {
          color = colors.greenAccent[500];
        } else if (status === "Lost") {
          color = colors.redAccent[500];
        } else if (status === "Cancelled") {
          color = colors.blueAccent[500];
        } else {
          color = colors.grey[500];
        }
        
        return (
          <Box
            sx={{
              color: color,
              fontWeight: "bold"
            }}
          >
            {status}
          </Box>
        );
      }
    },
    { 
      field: 'result', 
      headerName: 'Result', 
      flex: 0.7,
      renderCell: (params) => {
        return params.value === "Cancelled" ? (
          <Box sx={{ color: colors.blueAccent[500], fontWeight: "bold" }}>
            {params.value}
          </Box>
        ) : params.value;
      }
    },
    { 
      field: 'stake', 
      headerName: 'Stake', 
      flex: 0.7,
      valueFormatter: (params) => {
        if (params.value) {
          return parseFloat(params.value).toFixed(2);
        }
        return "N/A";
      }
    },
    { field: 'createdAt', headerName: 'Date', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      renderCell: (params) => (
        <IconButton
          onClick={() => openDetailDialog(params.row)}
          color="secondary"
        >
          <InfoIcon />
        </IconButton>
      )
    }
  ];

  // Refresh all data
  const refreshAllData = () => {
    fetchMatches();
    if (tabValue === 1 && selectedMatch) {
      fetchFancyMarkets();
    }
    fetchRecentDeclarations();
    showSnackbar("Data refreshed successfully");
  };

  // Render match selection dropdown with status indicators
  const renderMatchSelection = () => {
    return (
      <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
        <InputLabel>Select a Match</InputLabel>
        <Select
          value={selectedMatch}
          onChange={(e) => setSelectedMatch(e.target.value)}
          label="Select a Match"
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {matches.map((match, index) => {
            // Handle both object format and string format
            const matchName = typeof match === 'object' ? match.match : match;
            const matchStatus = typeof match === 'object' ? match.status : 'live';
            
            return (
              <MenuItem key={index} value={match}>
                {matchName}
                {matchStatus && (
                  <Box 
                    component="span" 
                    sx={{ 
                      ml: 1, 
                      display: 'inline-block', 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%', 
                      bgcolor: matchStatus === 'live' ? 'success.main' : 'text.disabled'
                    }} 
                  />
                )}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    );
  };

  // Render fancy market selection dropdown with status indicators
  const renderFancyMarketSelection = () => {
    return (
      <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
        <InputLabel>Select a Fancy Market</InputLabel>
        <Select
          value={selectedMarket}
          onChange={(e) => setSelectedMarket(e.target.value)}
          label="Select a Fancy Market"
          disabled={!selectedMatch}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {fancyMarkets.map((market) => (
            <MenuItem key={market._id} value={market}>
              {market.name}
              {market.status && (
                <Box 
                  component="span" 
                  sx={{ 
                    ml: 1, 
                    display: 'inline-block', 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    bgcolor: market.status === 'live' ? 'success.main' : 'text.disabled'
                  }} 
                />
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  return (
    <Box m="20px">
      <Header title="Result Declaration" subtitle="Declare results for cricket matches and fancy markets" />
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" sx={{ color: "#19d5b4" }}>
          {tabValue === 0 ? "Match Odds Result Declaration" : "Fancy Market Result Declaration"}
        </Typography>
        <IconButton onClick={refreshAllData} color="primary" disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>
      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Match Odds" />
        <Tab label="Fancy Markets" />
      </Tabs>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" color={colors.greenAccent[400]} mb={2}>
          {tabValue === 0 ? "Declare Match Odds Result" : "Declare Fancy Market Result"}
        </Typography>
        
        <Box display="flex" flexDirection="column" gap={2}>
          {/* Match Selection */}
          {renderMatchSelection()}

          {/* Fancy Market Selection (only for Fancy tab) */}
          {tabValue === 1 && renderFancyMarketSelection()}

          {/* Result Type */}
          <FormControl fullWidth>
            <InputLabel>Result Type</InputLabel>
            <Select
              value={resultType}
              onChange={(e) => setResultType(e.target.value)}
              label="Result Type"
              disabled={loading}
            >
              <MenuItem value="win">Win</MenuItem>
              <MenuItem value="cancel">Cancel</MenuItem>
            </Select>
          </FormControl>
          
          {/* Result Value (not needed for cancel) */}
          {resultType !== "cancel" && (
            <TextField
              label={tabValue === 0 ? "Winning Team" : "Result Value"}
              value={resultValue}
              onChange={(e) => setResultValue(e.target.value)}
              fullWidth
              disabled={loading}
              helperText={tabValue === 0 
                ? "Enter the name of the winning team exactly as it appears in the bets" 
                : "Enter the exact numeric value for the fancy market result"
              }
            />
          )}
          
          {/* Action Buttons */}
          <Box display="flex" gap={2} mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={tabValue === 0 ? handleDeclareMatchResult : handleDeclareFancyResult}
              disabled={loading || !selectedMatch || (tabValue === 1 && !selectedMarket) || (resultType !== "cancel" && !resultValue)}
              sx={{ flex: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : "Declare Result"}
            </Button>
            
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleRevertResult}
              disabled={loading || !selectedMatch || (tabValue === 1 && !selectedMarket)}
              sx={{ flex: 1 }}
            >
              Revert Result
            </Button>
          </Box>
        </Box>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" color={colors.greenAccent[400]}>
            Recent Declarations
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={fetchRecentDeclarations}
            disabled={loading}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>
        
        <Box height="400px">
          <DataGrid
            rows={recentDeclarations}
            columns={[
              { field: "match", headerName: "Match", flex: 1 },
              { field: "label", headerName: "Market", flex: 1 },
              { field: "type", headerName: "Bet Type", flex: 0.5 },
              { field: "run", headerName: "Selection", flex: 0.5 },
              { field: "result", headerName: "Result", flex: 0.5 },
              { field: "status", headerName: "Status", flex: 0.5,
                renderCell: (params) => (
                  <Box
                    width="80%"
                    p="5px"
                    display="flex"
                    justifyContent="center"
                    backgroundColor={
                      params.row.status === "Won"
                        ? colors.greenAccent[600]
                        : params.row.status === "Lost"
                        ? colors.redAccent[600]
                        : params.row.status === "Cancelled"
                        ? colors.blueAccent[600]
                        : colors.grey[500]
                    }
                    borderRadius="4px"
                  >
                    {params.row.status}
                  </Box>
                ),
              },
              { field: "createdAt", headerName: "Date", flex: 1 },
              {
                field: "actions",
                headerName: "Actions",
                flex: 0.5,
                renderCell: (params) => (
                  <IconButton
                    onClick={() => openDetailDialog(params.row)}
                    color="primary"
                  >
                    <InfoIcon />
                  </IconButton>
                ),
              },
            ]}
            loading={loading}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            getRowClassName={(params) =>
              params.row.status === "Won"
                ? "won-row"
                : params.row.status === "Lost"
                ? "lost-row"
                : ""
            }
          />
        </Box>
      </Paper>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (confirmDialog.onConfirm) {
                confirmDialog.onConfirm();
              }
            }} 
            color="secondary" 
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Detail Dialog */}
      <Dialog
        open={detailDialog.open}
        onClose={closeDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Bet Details</DialogTitle>
        <DialogContent>
          {detailDialog.bet && (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Match:</strong> {detailDialog.bet.match}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Market:</strong> {detailDialog.bet.label}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Selection:</strong> {detailDialog.bet.run}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Type:</strong> {detailDialog.bet.type}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Odds:</strong> {detailDialog.bet.odds}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Stake:</strong> ₹{parseFloat(detailDialog.bet.stake).toFixed(2)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Profit:</strong> ₹{parseFloat(detailDialog.bet.profit).toFixed(2)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Status:</strong> {detailDialog.bet.status}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Result:</strong> {detailDialog.bet.result}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Date:</strong> {detailDialog.bet.createdAt}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetailDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResultDeclaration; 