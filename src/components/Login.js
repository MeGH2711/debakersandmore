import React, { useState } from "react";
import "../App.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Form, Button, Card, InputGroup } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      const expiry = new Date().getTime() + 24 * 60 * 60 * 1000;
      localStorage.setItem("adminSession", JSON.stringify({ uid: user.uid, expiry }));

      navigate("/admin");
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background:
          "radial-gradient(circle at top left, #1e1e2f, #0d0d0d 80%)",
        color: "#fff",
      }}
    >
      <Card
        className="p-5 text-light border-0 shadow-lg"
        style={{
          width: "400px",
          background: "rgba(30, 30, 30, 0.8)",
          backdropFilter: "blur(10px)",
          borderRadius: "1rem",
        }}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold text-warning">De Baker’s Admin</h2>
          <p className="small mb-0">Sign in to manage your menu</p>
        </div>

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold text-light">Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="admin@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-dark text-light border border-warning border-opacity-50 rounded-3 shadow-sm customLoginInput"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold text-light">Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-dark text-light border border-warning border-opacity-50 rounded-start-3 shadow-sm customLoginInput"
              />
              <InputGroup.Text
                onClick={() => setShowPassword(!showPassword)}
                className="bg-dark text-warning border border-warning border-opacity-50 rounded-end-3"
                style={{ cursor: "pointer" }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          {error && (
            <div className="text-danger text-center small mb-3">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="warning"
            className="w-100 fw-semibold text-dark py-2 rounded-3 shadow"
            style={{ letterSpacing: "0.5px" }}
          >
            Login
          </Button>
        </Form>

        <div className="text-center mt-4">
          <small>
            © {new Date().getFullYear()} De Baker’s & More
          </small>
        </div>
      </Card>
    </div>
  );
};

export default Login;