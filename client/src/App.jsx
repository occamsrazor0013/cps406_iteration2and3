import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ChakraProvider } from '@chakra-ui/react'
import Login from "./Login";
import Register from "./Register";
import Reset from "./Reset";
import Dashboard from "./Dashboard";
import StripeApp from "./StripeApp";
import CheckoutForm from "./CheckoutForm";
function App() {
  return (
    <ChakraProvider>
      <div className="app">
        <Router>
          <Routes>
            <Route exact path="/" element={<Login />} />
            <Route exact path="/register" element={<Register />} />
            <Route exact path="/reset" element={<Reset />} />
            <Route exact path="/dashboard" element={<Dashboard />} />
            <Route exact path="/stripeapp" element={<StripeApp />} />
            <Route exact path="/checkoutform" element={<CheckoutForm />} />
          </Routes>
        </Router>
      </div>
    </ChakraProvider>
  );
}
export default App;