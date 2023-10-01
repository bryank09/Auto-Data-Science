import React from 'react';
import { useState, useRef } from 'react';
import { Container, Row, Col, Button, Card, Modal } from "react-bootstrap";
import StripeContainer from './StripeContainer';
import priceImg from '../assets/img/boba-tikus.JPG';

const Pricing = () => {
    const features = ["Data collection and preparation",
        "Model building and deployment",
        "Automated workflows",
        "Scalability",
        "Security"];

    const updatedFeature = features.map((feature) => {
        return <li>{feature}</li>;
    });

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    return (
        <section>
            <Container id="pricing-header" className="d-flex flex-column gap-5">
                <Row className="d-flex flex-column align-items-center justify-content-center gap-3">
                    <p className="title">Data science insights that are affordable for everyone</p>
                    <p className="description">Our data science solution is the perfect blend of automation and human expertise, giving you the ability to do more with your data.</p>
                </Row>
                <Row>
                    <h5 style={{ textAlign: "center" }}>Get your Free 50 Predictions</h5>
                    <Col className="d-flex justify-content-center">
                        <Button onClick={handleShow}>Try for Free!</Button>{' '}
                    </Col>
                </Row>
            </Container>
            <Container className="d-flex">
                <Col>
                    <Card style={{ width: '18rem' }}>
                        <Card.Body>
                            <Card.Title>RM 29.99 / Month</Card.Title>
                            <Card.Text>
                                <ul style={{ fontSize: 16 }}>
                                    {updatedFeature}
                                </ul>
                            </Card.Text>
                            <Button onClick={handleShow}>Get Premium!</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Container>
            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Auto AI Online Payment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <PaymentForm />
                </Modal.Body>
            </Modal>
        </section>
    )
}

// const PaymentModal = ({ handleShow }) => {
//     const [show, setShow] = useState(false);
//     const handleClose = () => setShow(false);

//     return (
//         <Modal
//             show={show}
//             onHide={handleClose}
//             backdrop="static"
//             keyboard={false}
//         >
//             <Modal.Header closeButton>
//                 <Modal.Title>Auto AI Online Payment</Modal.Title>
//             </Modal.Header>
//             <Modal.Body>
//                 <PaymentForm />
//             </Modal.Body>
//         </Modal>
//     )
// }

const PaymentForm = () => {
    const [showItem, setShowItem] = useState(false);

    // const Form = () => {
    //     <div className="d-flex flex-column justify-content-center">
    //         <h4>RM 29.99</h4>
    //         <img src={pricing}
    //             alt="Pricing Image"
    //             width={250}
    //             height={250} />
    //         <button onClick={() => setShowItem(true)}>BUY SERVICE</button>
    //     </div>
    // }

    return (
        <Col>
            <h2>AI Prediction Dashboard Service</h2>
            {showItem ? <StripeContainer />
                :
                <div className="d-flex flex-column align-items-center gap-3">
                    <h4>RM 29.99</h4>
                    <div className="d-flex flex-column align-items-center">
                        <img src={priceImg}
                            alt="Pricing Image"
                            width={250}
                            height={250} />
                        <p>Dont have the product picture, enjoy the cute dog!</p>
                    </div>
                    <Button onClick={() => setShowItem(true)}>BUY NOW!</Button>
                </div>}
        </Col>
    )
}

export default Pricing;