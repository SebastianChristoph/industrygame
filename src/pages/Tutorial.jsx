import {
  Factory as FactoryIcon,
  Info as InfoIcon,
  Science as ScienceIcon,
  ShoppingCart as ShoppingCartIcon,
  Storage as StorageIcon,
  Timer as TimerIcon,
} from "@mui/icons-material";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography
} from "@mui/material";
import React from "react";

const Tutorial = () => {
  return (
    <Box
      sx={{
        p: 3,
        minHeight: "95vh",
        width: "100%",
        overflowX: "hidden",
        boxSizing: "border-box",
        backgroundImage: "url(/images/background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
    
      }}
    >
       <Typography
              variant="h4"
              sx={{
                mb: 3,
                fontWeight: 900,
                fontSize: "2.5rem",
                color: "#fff",
                textShadow: "0 2px 8px #000, 0 1px 1px #000",
                //   background: 'rgba(30,30,30,0.7)',
                px: 2,
                py: 1,
                borderRadius: 2,
                width: "fit-content",
              }}
            >
           Tutorial
            </Typography>

      <Paper
        elevation={3}
        sx={{
          p: 3,
          width: "100%",
          background: "rgba(30,30,30,0.85)",
          color: "#fff",
          boxShadow: 6,
          "&:hover": {
            boxShadow: 10,
          },
          textAlign: "left",
        }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
        >
          <InfoIcon color="primary" /> Getting Started
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Welcome to the Industry Game! Here's a quick guide to help you get
          started:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <ScienceIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Research Module Selection"
              secondary="Start by selecting a research module in the Research area. This will unlock new production capabilities."
              primaryTypographyProps={{
                sx: { color: "#fff", fontWeight: 500 },
              }}
              secondaryTypographyProps={{ sx: { color: "#fff", opacity: 0.8 } }}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FactoryIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Create Production Lines"
              secondary="Once you have unlocked modules, create production lines to start manufacturing resources."
              primaryTypographyProps={{
                sx: { color: "#fff", fontWeight: 500 },
              }}
              secondaryTypographyProps={{ sx: { color: "#fff", opacity: 0.8 } }}
            />
          </ListItem>
        </List>
      </Paper>

      <Paper
        elevation={3}
        sx={{
          p: 3,
          width: "100%",
          background: "rgba(30,30,30,0.85)",
          color: "#fff",
          boxShadow: 6,
          "&:hover": {
            boxShadow: 10,
          },
          textAlign: "left",
        }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
        >
          <FactoryIcon color="primary" /> Production Lines
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Production lines are the core of your industrial empire. Here's what
          you need to know:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <ShoppingCartIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Input Sources"
              secondary="You can configure inputs to either automatically purchase resources or use them from your global storage."
              primaryTypographyProps={{
                sx: { color: "#fff", fontWeight: 500 },
              }}
              secondaryTypographyProps={{ sx: { color: "#fff", opacity: 0.8 } }}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <StorageIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Output Targets"
              secondary="Choose whether to store produced resources in your global storage or automatically sell them for credits."
              primaryTypographyProps={{
                sx: { color: "#fff", fontWeight: 500 },
              }}
              secondaryTypographyProps={{ sx: { color: "#fff", opacity: 0.8 } }}
            />
          </ListItem>
        </List>
      </Paper>

      <Paper
        elevation={3}
        sx={{
          p: 3,
          width: "100%",
          background: "rgba(30,30,30,0.85)",
          color: "#fff",
          boxShadow: 6,
          "&:hover": {
            boxShadow: 10,
          },
          textAlign: "left",
        }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
        >
          <TimerIcon color="primary" /> Global Ping System
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          The game operates on a ping-based system:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <TimerIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Ping Timer"
              secondary="Watch the ping indicator in the bottom right corner. Each ping represents one production cycle."
              primaryTypographyProps={{
                sx: { color: "#fff", fontWeight: 500 },
              }}
              secondaryTypographyProps={{ sx: { color: "#fff", opacity: 0.8 } }}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FactoryIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Production Timing"
              secondary="Production lines have different ping requirements. Some items take longer to produce than others."
              primaryTypographyProps={{
                sx: { color: "#fff", fontWeight: 500 },
              }}
              secondaryTypographyProps={{ sx: { color: "#fff", opacity: 0.8 } }}
            />
          </ListItem>
        </List>
      </Paper>

      <Paper
        elevation={3}
        sx={{
          p: 3,
          width: "100%",
          background: "rgba(30,30,30,0.85)",
          color: "#fff",
          boxShadow: 6,
          "&:hover": {
            boxShadow: 10,
          },
          textAlign: "left",
        }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
        >
          <ScienceIcon color="primary" /> Research System
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Research is key to expanding your industrial capabilities:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <ScienceIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Research Points"
              secondary="Earn research points by selling resources. Use these points to unlock new modules and recipes."
              primaryTypographyProps={{
                sx: { color: "#fff", fontWeight: 500 },
              }}
              secondaryTypographyProps={{ sx: { color: "#fff", opacity: 0.8 } }}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FactoryIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Module Unlocking"
              secondary="Unlock new production modules to access more advanced recipes and increase your production capabilities."
              primaryTypographyProps={{
                sx: { color: "#fff", fontWeight: 500 },
              }}
              secondaryTypographyProps={{ sx: { color: "#fff", opacity: 0.8 } }}
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default Tutorial;
