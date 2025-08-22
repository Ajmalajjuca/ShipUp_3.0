import React, { useState, useEffect, useRef } from "react";
import {
  Truck,
  MapPin,
  Clock,
  CreditCard,
  DollarSign,
  Package,
} from "lucide-react";
import { toast } from "react-hot-toast";
import AddressSelector from "../../../components/user/BookingComponents/AddressSelector";
import VehicleSelection from "../../../components/user/BookingComponents/VehicleSelection";
import DeliveryTypeSelection from "../../../components/user/BookingComponents/DeliveryTypeSelection";
import PaymentMethodSelection from "../../../components/user/BookingComponents/PaymentMethodSelection";
import HomeLayout from "../../../components/user/layout/HomeLayout";
import type { DriverTracking, OrderDetails, OrderStatus, PaymentMethod, PricingConfig, vehicle } from "../../../types";



const OrderBooking: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicles, setVehicles] = useState<Array<vehicle>>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(null);
  const [driverTracking, setDriverTracking] = useState<DriverTracking | null>(null);
  const driverLocationInterval = useRef<NodeJS.Timeout | null>(null);


  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    pickupAddress: null,
    dropoffAddress: null,
    vehicleId: null,
    deliveryType: null,
    paymentMethod: null,
    distance: 0,
    price: 0,
    basePrice: 0,
    deliveryPrice: 0,
    commission: 0,
    gstAmount: 0,
    estimatedTime: "",
    effectiveDistance: 0,
  });



  const updateOrderDetails = (key: keyof OrderDetails, value: any) => {
    setOrderDetails((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleVehicleSelect = (vehicleId: string) => {
    const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
    if (selectedVehicle) {
      setOrderDetails((prev) => ({
        ...prev,
        vehicleId: selectedVehicle.id,
        vehicleName: selectedVehicle.name,
        vehiclePricePerKm: selectedVehicle.pricePerKm,
      }));
    }
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setOrderDetails((prev) => ({
      ...prev,
      paymentMethod: method,
    }));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // if (!orderDetails.pickupAddress || !orderDetails.dropoffAddress) {
      //   toast.error("Please select both pickup and dropoff locations");
      //   return;
      // }
    } else if (currentStep === 2) {
      // if (!orderDetails.vehicleId) {
      //   toast.error("Please select a vehicle");
      //   return;
      // }
    } else if (currentStep === 3) {
      if (!orderDetails.deliveryType) {
        toast.error("Please select a delivery type");
        return;
      }
    } else if (currentStep === 4) {
      // if (!orderDetails.paymentMethod) {
      //   toast.error("Please select a payment method");
      //   return;
      // }
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };


  useEffect(() => {
    return () => {
      if (driverLocationInterval.current) {
        clearInterval(driverLocationInterval.current);
      }
    };
  }, []);



  const getProgress = () => {
    return (currentStep / 5) * 100;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <AddressSelector
            pickupAddress={orderDetails.pickupAddress}
            dropoffAddress={orderDetails.dropoffAddress}
            onPickupSelected={(address) =>
              updateOrderDetails("pickupAddress", address)
            }
            onDropoffSelected={(address) =>
              updateOrderDetails("dropoffAddress", address)
            }
          />
        );
      case 2:
        return (
          <VehicleSelection
            vehicles={vehicles}
            selectedVehicleId={orderDetails.vehicleId}
            onSelect={handleVehicleSelect}
          />
        );
      case 3:
        return (
          <DeliveryTypeSelection
            selectedType={orderDetails.deliveryType}
            onSelect={(type) => updateOrderDetails("deliveryType", type)}
          />
        );
      case 4:
        return (
          <PaymentMethodSelection
            selectedMethod={orderDetails.paymentMethod}
            onSelect={handlePaymentMethodSelect}
            orderAmount={orderDetails.price}
          />
        );
      case 5:
        return (
          <div>
            {/* {orderDetails.paymentMethod === "stripe" && (
              <div className="mb-4 p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">Enter Card Details</h3>
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#424770",
                        "::placeholder": {
                          color: "#aab7c4",
                        },
                      },
                      invalid: {
                        color: "#9e2146",
                      },
                    },
                  }}
                  onChange={(e) => setCardComplete(e.complete)}
                />
              </div>
            )} */}
            {/* <OrderSummary
              orderDetails={orderDetails as any}
              onSubmit={submitOrder}
              isLoading={isLoading}
              onBack={handlePreviousStep}
              cardComplete={
                orderDetails.paymentMethod === "stripe" ? cardComplete : true
              }
            /> */}
          </div>
        );
      default:
        return null;
    }
  };



  const renderOrderStatus = () => {
    console.log("Rendering order status:", { orderStatus, driverTracking });
    if (!orderStatus) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="mb-4">
              {orderStatus === "finding_driver" ? (
                <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg
                    className="animate-spin h-8 w-8 text-yellow-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              ) : orderStatus === "driver_arrived" ? (
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin size={32} className="text-blue-500" />
                </div>
              ) : orderStatus === "picked_up" ? (
                <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-full flex items-center justify-center">
                  <Package size={32} className="text-indigo-500" />
                </div>
              ) : orderStatus === "completed" ? (
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="h-8 w-8 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
              ) : (
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="h-8 w-8 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
              )}
            </div>

            <h3 className="text-lg font-medium mb-2">
              {orderStatus === "finding_driver" && "Finding a driver..."}
              {orderStatus === "driver_assigned" && "Driver found!"}
              {orderStatus === "driver_arrived" && "Driver has arrived!"}
              {orderStatus === "picked_up" && "Package picked up!"}
              {orderStatus === "completed" && "Delivery completed!"}
            </h3>

            {orderStatus === "completed" && (
              <div>
                <p className="text-gray-600 mb-4">
                  Your delivery has been completed successfully! Thank you for
                  using our service.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <HomeLayout>
      <div className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="w-full h-2 bg-gray-200">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
            <div className="flex justify-between px-8 pt-6">
              <div
                className={`flex flex-col items-center ${
                  currentStep >= 1 ? "text-red-500" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= 1
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                >
                  <MapPin size={20} />
                </div>
                <span className="text-xs mt-1">Location</span>
              </div>
              <div
                className={`flex flex-col items-center ${
                  currentStep >= 2 ? "text-red-500" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= 2
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                >
                  <Truck size={20} />
                </div>
                <span className="text-xs mt-1">Vehicle</span>
              </div>
              <div
                className={`flex flex-col items-center ${
                  currentStep >= 3 ? "text-red-500" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= 3
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                >
                  <Clock size={20} />
                </div>
                <span className="text-xs mt-1">Delivery</span>
              </div>
              <div
                className={`flex flex-col items-center ${
                  currentStep >= 4 ? "text-red-500" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= 4
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                >
                  <DollarSign size={20} />
                </div>
                <span className="text-xs mt-1">Payment</span>
              </div>
              <div
                className={`flex flex-col items-center ${
                  currentStep >= 5 ? "text-red-500" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= 5
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                >
                  <CreditCard size={20} />
                </div>
                <span className="text-xs mt-1">Summary</span>
              </div>
            </div>
            <div className="p-6">{renderStep()}</div>
            {currentStep < 5 && (
              <div className="flex justify-between p-6 border-t">
                <button
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                  className={`px-4 py-2 rounded-lg ${
                    currentStep === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 transition-colors"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {renderOrderStatus()}
    </HomeLayout>
  );
};

export default OrderBooking;
