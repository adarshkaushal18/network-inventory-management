import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Box,
  Checkbox,
  FormControlLabel
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import toast from "react-hot-toast";

const users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "manager", password: "manager123", role: "network-admin" },
  { username: "user", password: "user123", role: "user" }
];

const LoginPage = ({ setCurrentUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = users.find(
      (u) =>
        u.username === formData.username &&
        u.password === formData.password
    );
    if (user) {
      setCurrentUser(user);
      toast.success(`Welcome, ${user.username}`);
      navigate(`/${user.role}-dashboard`, { replace: true });
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(to right, #00c6ff, #0072ff)",
        animation: "fadeIn 1s ease-in-out",
        "@keyframes fadeIn": {
          from: { opacity: 0 },
          to: { opacity: 1 }
        }
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          borderRadius: 3,
          width: { xs: "90%", sm: 400 },
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "scale(1.02)"
          }
        }}
      >
        <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
          🔐 Network Inventory Login 
        </Typography>
        <Typography variant="body2" textAlign="center" color="text.secondary" mb={2}>
          Please enter your credentials to continue
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Username"
              name="username"
              variant="outlined"
              fullWidth
              value={formData.username}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1 }} />
              }}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              variant="outlined"
              fullWidth
              value={formData.password}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <LockIcon sx={{ mr: 1 }} />
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              }
              label="Remember Me"
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Login
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage;
