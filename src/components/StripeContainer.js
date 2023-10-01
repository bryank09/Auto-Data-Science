import React from "react"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import PaymentForm from "./PaymentForm"

const PUBLIC_KEY = "pk_test_51NlatdFwzIOyRIgASJvSp3rCnKO8kS4F344A3s88PWm9uReUKpVAV0jFyWYUI2db8eYWTTw0EnElulKAzeiRGTsV00LlTHmvOU"
const stripeTestPromise = loadStripe(PUBLIC_KEY)

export default function StripeContainer() {
  return (
    <Elements stripe={stripeTestPromise}>
      <PaymentForm />
    </Elements>
  )
}