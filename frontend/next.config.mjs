/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // build ra thư mục tĩnh frontend/out để backend (python run.py) phục vụ
  agentRules: false, // không để Next tự sinh AGENTS.md trong frontend/
};

export default nextConfig;
