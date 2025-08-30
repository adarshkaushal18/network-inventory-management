import {
    Box,
    Toolbar,
    Typography,
    AppBar,
    CssBaseline,
    IconButton,
    Avatar
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "../components/Sidebar"; // ✅
import { useState } from "react";

const drawerWidth = 240;

const MainLayout = ({ currentUser, handleLogout, children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: "flex", background: "linear-gradient(to right, #1e3c72, #2a5298)", minHeight: "100vh" }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: "#141414" }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerToggle}
                        edge="start"
                        sx={{ mr: 2, display: { sm: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Network Inventory Management
                    </Typography>
                    {currentUser && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography>{currentUser.username}</Typography>
                            <Avatar sx={{ bgcolor: "#e50914"}}>{currentUser.username[0].toUpperCase()}</Avatar>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            <Sidebar
                currentUser={currentUser}
                drawerWidth={drawerWidth}
                mobileOpen={mobileOpen}
                handleDrawerToggle={handleDrawerToggle}
                handleLogout={handleLogout}
            />
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}>
                {children}
            </Box>
        </Box>
    );
};

export default MainLayout;
