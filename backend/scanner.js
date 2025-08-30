import snmp from "net-snmp";
import ip from "ip";
import pLimit from "p-limit";

const COMMUNITY = "public"; // SNMP community string
const OIDS = [
    "1.3.6.1.2.1.1.5.0", // sysName
    "1.3.6.1.2.1.1.1.0", // sysDescr
    "1.3.6.1.2.1.1.1.3.0"  // sysUpTime
];

// Query a device
function checkDevice(ipAddress) {
    return new Promise((resolve, reject) => {
        const session = snmp.createSession(ipAddress, COMMUNITY, {timeout: 1000});
        session.get(OIDS, (error, varbinds) => {
            if (error) {
                return reject(error);
            } 
            
            const result = {
                ip: ipAddress,
                sysName: varbinds[0]?.value?.toString() || null,
                sysDescr: varbinds[1]?.value?.toString() || null,
                sysUpTime: varbinds[2]?.value?.toString() || null
            };
            resolve(result);
            session.close();
        });
    });
}

function ipList() {
    return ['192.168.1.1', '192.168.1.2', '192.168.1.3'];
}

// Generate all IPs from a CIDR
function getIPsFromCIDR(cidr) {
    const range = ip.cidrSubnet(cidr);
    const start = ip.toLong(range.networkAddress);
    const end = ip.toLong(range.broadcastAddress);

    const ips = [];
    for (let i = start; i <= end; i++) {
        ips.push(ip.fromLong(i));
    }
    return ips;
}

function getDeviceInfo(ipAddress) {
    return checkDevice(ipAddress);
}

async function scanNetwork(cidr) {
    const devices = ipList(); // getIPsFromCIDR(cidr)
    const limit = pLimit(3); // Limit concurrency to 3
    const responsers = [];
    const nonResponders = [];

    const tasks = devices.map(ipAddress => limit(() => getDeviceInfo(ipAddress)
        .then(info => responsers.push(info))
        .catch(() => nonResponders.push(ipAddress))
    ));

    await Promise.all(tasks);
    return { responsers, nonResponders };
}

export { getDeviceInfo, scanNetwork };