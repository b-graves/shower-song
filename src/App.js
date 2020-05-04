import React from 'react';
import './App.css';

import { Container, Row, Col } from 'reactstrap';

import ConnectSpotify from "./components/ConnectSpotify/ConnectSpotify";

function App() {
  return (
    <div className="App">
      <Container>
        <Row>
          <Col sm="12" md={{ size: 6, offset: 3 }}>
            <ConnectSpotify />
          </Col>
        </Row>
      </Container>
    </div >
  );
}

export default App;
