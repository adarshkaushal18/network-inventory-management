import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Box,
    Typography
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ currentUser, drawerWidth, mobileOpen, handleDrawerToggle, handleLogout }) => {
    const navigate = useNavigate();

    const drawer = (
        <Box>
            <Box
                sx={{
                    height: 150,
                    backgroundImage: "url('/path/to/your/image.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
            />
            <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" color="white">
                    {currentUser?.username || "Guest"}
                </Typography>
                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                    Role: {currentUser?.role || "guest"}
                </Typography>
            </Box>
            <Divider />

            <List>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => navigate("/dashboard")}
                        sx={{ "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" } }}
                        aria-label="Go to Dashboard"
                    >
                        <ListItemIcon>
                            <DashboardIcon sx={{ color: "white" }} />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" sx={{ color: "white" }} />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => navigate("/inventory")}
                        sx={{ "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" } }}
                        aria-label="Go to Inventory"
                    >
                        <ListItemIcon>
                            <InventoryIcon sx={{ color: "white" }} />
                        </ListItemIcon>
                        <ListItemText primary="Inventory" sx={{ color: "white" }} />
                    </ListItemButton>
                </ListItem>

                {["admin", "network-admin"].includes(currentUser?.role) && (
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={() => navigate("/add-device")}
                            sx={{ "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" } }}
                            aria-label="Add Device"
                        >
                            <ListItemIcon>
                                <AddCircleIcon sx={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="Add Device" sx={{ color: "white" }} />
                        </ListItemButton>
                    </ListItem>
                )}

                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => {
                            handleLogout();
                            navigate("/login", { replace: true });
                        }}
                        sx={{ "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" } }}
                        aria-label="Logout"
                    >
                        <ListItemIcon>
                            <LogoutIcon sx={{ color: "white" }} />
                        </ListItemIcon>
                        <ListItemText primary="Logout" sx={{ color: "white" }} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            aria-label="Sidebar Navigation"
        >
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", sm: "none" },
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: drawerWidth,
                        backgroundColor: "#2c3e50",
                        color: "white"
                    }
                }}
            >
                {drawer}
            </Drawer>

            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", sm: "block" },
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: drawerWidth,
                        backgroundColor: "#2c3e50",
                        color: "white"
                    }
                }}
                open
            >
                {drawer}
            </Drawer>
        </Box>
    );
};

export default Sidebar;