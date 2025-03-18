import { Box } from "@mui/material";
import Header from "../components/Header";
import PieChart from "../components/PieChart";

const Pie = () => {
  return (
    <Box m="0.5rem 1rem">
      <Header
        title="Profit/Loss"
        subtitle="Profit and Loss visualize the TRUSTBET247 business"
      />
      <Box height="75vh">
        <PieChart />
      </Box>
    </Box>
  );
};

export default Pie;
