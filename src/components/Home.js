import React from 'react';
import { useState, useRef } from 'react';
import { Container, Row, Col, Button } from "react-bootstrap";
import Lottie from 'lottie-react';
import { Link } from "react-router-dom";
import bannerAnim from '../assets/img/banner-animation.json';
import StripeContainer from './StripeContainer';
import dashboardPreview from '../assets/img/dashboard-preview.png';
// import priceImg from '../assets/img/boba-tikus.JPG';

export const Banner = () => {
    const bannerRef = useRef(null);
    const [anim, setAnim] = useState(true);

    const [showItem, setShowItem] = useState(false);

    return (
        <section>
            <Container className="d-flex flex-column gap-5">
                <Row>
                    <Col md={6} className="d-flex flex-column align-items-center justify-content-center">
                        <h2>Unleash Data Magic: Transforming Insights with Automated Data Science</h2>
                        <div>
                            <a target='_blank'
                                rel='noopener noreferrer' href="https://buy.stripe.com/dR6fZGaC3bhRcXmbII" >
                                <Button>Get Started</Button>{' '}
                            </a>
                            <Button className="secondary-button">Learn More</Button>{' '}
                        </div>
                    </Col>
                    <Col md={6}>
                        <Lottie
                            onComplete={() => {
                                var frame = anim ? [60, 30] : [30, 60];
                                setAnim(!anim);
                                bannerRef.current?.playSegments(frame, false);
                            }}
                            lottieRef={bannerRef}
                            loop={false}
                            animationData={bannerAnim} />
                    </Col>
                </Row>
                <Row className="d-flex align-items-center justify-content-center" style={{padding:"2em"}}>
                    <h2>Dashboard Preview</h2>
                    <img src={dashboardPreview}
                        alt="Pricing Image" style={{boxShadow: '1px 2px 9px'}}/>
                </Row>
            </Container>
        </section>
    );
}