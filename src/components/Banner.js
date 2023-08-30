import React from 'react';
import { useState, useRef } from 'react';
import { Container, Row, Col, Button } from "react-bootstrap";
import Lottie from 'lottie-react';
import bannerAnim from '../assets/img/banner-animation.json'

export const Banner = () => {
    const bannerRef = useRef(null);
    const [anim, setAnim] = useState(true);

    return (
        <section id="banner">
            <div>
                <Container>
                    <Row>
                        <Col md={6} className="d-flex flex-column align-items-center justify-content-center">
                            <h2>Unleash Data Magic: Transforming Insights with Automated Data Science</h2>
                            <div>
                                <Button>Get Started</Button>{' '}
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
                </Container>
            </div>
        </section>
    );
}