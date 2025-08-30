import MainLayout from "../components/MainLayout";
import {
    Typography,
    Card,
    Grid,
    CardContent,
    Box,
    Tooltip
} from "@mui/material";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Legend
} from "recharts";

const Dashboard = ({ currentUser, allDevices, handleLogout }) => {
    if (!Array.isArray(allDevices)) {
        return (
            <MainLayout currentUser={currentUser} handleLogout={handleLogout}>
            <Typography>Loading device data...</Typography>
            </MainLayout>
        );
    }

    const activeCount = allDevices.filter(d => !d.isDeleted && d.status === "active").length;
    const inactiveCount = allDevices.filter(d => !d.isDeleted && d.status === "inactive").length;
    const deletedCount = allDevices.filter(d => d.isDeleted).length;
    const physicalCount = allDevices.filter(d => d.type === "physical").length;
    const virtualCount = allDevices.filter(d => d.type === "virtual").length;

    const cards = [
        { title: "Active Devices", value: activeCount, color: "linear-gradient(135deg, #2e7d32, #66bb6a)", tooltip: "Active devices are currently in use." },
        { title: "Inactive Devices", value: inactiveCount, color: "linear-gradient(135deg, #f57c00, #ffb74d)", tooltip: "Inactive devices are not in use." },
        { title: "Deleted Devices", value: deletedCount, color: "linear-gradient(135deg, #c62828, #ef5350)", tooltip: "Deleted devices are no longer available." },
        { title: "Physical Devices", value: physicalCount, color: "linear-gradient(135deg, #1976d2, #64b5f6)", tooltip: "Physical devices are tangible assets." },
        { title: "Virtual Devices", value: virtualCount, color: "linear-gradient(135deg, #8e24aa, #ab47bc)", tooltip: "Virtual devices are software-based." }
    ];

    const deviceTypeData = [
        { name: "Physical", value: physicalCount },
        { name: "Virtual", value: virtualCount }
    ];

    const deviceStatusData = [
        { name: "Active", value: activeCount },
        { name: "Inactive", value: inactiveCount },
        { name: "Deleted", value: deletedCount }
    ];

    const COLORS = ["#00c49f", "#ffbb28", "#ff8042", "#0088fe", "#a020f0", "#ff4444"];

    const getMonthlyDeviceData = () => {
        // Logic to get monthly device data
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyCounts = new Array(12).fill(0);

        allDevices.forEach(device => {
            if (device.createdAt) {
                const month = new Date(device.createdAt).getMonth();
                monthlyCounts[month]++;
            }
        });

        return monthNames.map((name, index) => ({
            Month: name,
            Devices: monthlyCounts[index]
        }));
    };

    const monthlyData = getMonthlyDeviceData();

    return (
        <MainLayout currentUser={currentUser} handleLogout={handleLogout}>
            <Typography variant="h4" mb={3}>
                Welcome, {currentUser?.username || "Guest"}
            </Typography>

            <Grid container spacing={3}>
                {cards.map((card) => (
                    <Grid item xs={12} sm={6} md={3} key={card.title}>
                        <Tooltip title={card.tooltip} arrow>
                            <Card
                                sx={{
                                    background: card.color,
                                    color: "white",
                                    borderRadius: 3,
                                    boxShadow: 4,
                                    transition: "transform 0.3s ease",
                                    "&:hover": {
                                        transform: "scale(1.05)",
                                        boxShadow: 6
                                    },
                                }}
                            >
                                <CardContent>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Typography variant="subtitle1">{card.title}</Typography>
                                    </Box>
                                    <Typography variant="h4" mt={2}>
                                        {card.value}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Tooltip>
                    </Grid>
                ))}
            </Grid>
            
            <Box mt={6}>
                <Typography variant="h6" gutterBottom>
                    Device Type Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={deviceTypeData} dataKey="value" nameKey="name" outerRadius={80} cx="50%" cy="50%" label>
                            {deviceTypeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>

                <Typography variant="h6" gutterBottom>
                    Device Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={deviceStatusData} dataKey="value" nameKey="name" outerRadius={80} cx="50%" cy="50%" label>
                            {deviceStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Box>

            <Box mt={6}>
                <Typography variant="h6" gutterBottom>
                    Monthly Device Creation
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="Month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Devices" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </MainLayout>
    );
};

export default Dashboard;

