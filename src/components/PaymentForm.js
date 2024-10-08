import React, { useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

const CARD_OPTIONS = {
	iconStyle: "solid",
	style: {
		base: {
			iconColor: "#c4f0ff",
			color: "#fff",
			fontWeight: 500,
			fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
			fontSize: "16px",
			fontSmoothing: "antialiased",
			":-webkit-autofill": { color: "#fce883" },
			"::placeholder": { color: "#87bbfd" }
		},
		invalid: {
			iconColor: "#ffc7ee",
			color: "#ffc7ee"
		}
	}
}

export default function PaymentForm() {
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    const handleSubmit = async(e)=>{
        e.preventDefault();
        const {error, paymentMethod} = await stripe.createPaymentMethod({
            type: "card",
            card: elements.getElement(CardElement)
        })
        
        if(!error){
            try{
                const {id} = paymentMethod;
                const response = await axios.post("http://localhost:4000/payment", {
                    amount: 2999,
                    id
                })
                if(response.data.success){
                    console.log("Success Payment");
                    setSuccess(true);
                    
                    navigate("/dashboard");
                }
            }catch(error) {
                console.log("Error: ", error)
                setErrorMsg("There is something wrong when processing the payment");
            }
        } else{
            console.log(error.msg)
            setErrorMsg("There is something wrong when processing the payment");
        }
    }
        
        return (
        <div>
            {
                !success?
                <form onSubmit={handleSubmit}>
                    <fieldset className="FormGroup">
                        <div className="FormRow">
                            <CardElement options={CARD_OPTIONS} />
                        </div>
                    </fieldset>
                    <p>{errorMsg}</p>
                    <button>Pay</button>
                </form>
                :
                <div>
                    <h2>Your Auto AI purchase was successful</h2>
                </div>
            }
        </div>
    )
}
