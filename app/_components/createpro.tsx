// components/CreateProfile.tsx

"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingAnimation from "@/public/Load.json";
import { Toaster, toast } from "sonner";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function CreatePro() {
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ image: boolean; phone: boolean; bio: boolean }>({
        image: false,
        phone: false,
        bio: false,
    });
    const [phone, setPhone] = useState("+976");
    const [bio, setBio] = useState("");

    // Handle image upload to Cloudinary
    const handleImageUpload = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            setErrors((prev) => ({ ...prev, image: true }));
            toast.error("Invalid image type. Please upload an image.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            setErrors((prev) => ({ ...prev, image: true }));
            toast.error("Image size is too large. Max size is 2MB.");
            return;
        }

        setLoading(true);

        // Form data to send to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "unsigned_preset"); // Use your Cloudinary preset  
        formData.append("cloud_name", "duhir31qk"); // Cloud name

        try {
            const response = await fetch("https://api.cloudinary.com/v1_1/duhir31qk/image/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (data.secure_url) {
                setImage(data.secure_url); // Set the uploaded image URL
                toast.success("Image uploaded successfully!");
            } else {
                toast.error("Failed to upload image.");
            }
        } catch (error) {
            toast.error("Error uploading image.");
        } finally {
            setLoading(false);
        }
    };

    // Handle phone input change (prepend +976)
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;

        // Ensure the phone number starts with +976
        if (!inputValue.startsWith("+976")) {
            inputValue = "+976" + inputValue.replace(/^(\+976)?/, "");
        }

        setPhone(inputValue);
    };

    // Handle form submission
    const handleSubmit = async () => {
        let hasError = false;

        // Check if image is uploaded
        if (!image) {
            setErrors((prev) => ({ ...prev, image: true }));
            hasError = true;
            toast.error("Please upload a profile picture.");
        } else {
            setErrors((prev) => ({ ...prev, image: false }));
        }

        // Validate phone number
        if (!/^\+976\d{8,10}$/.test(phone)) {
            setErrors((prev) => ({ ...prev, phone: true }));
            hasError = true;
            toast.error("Please enter a valid phone number.");
        } else {
            setErrors((prev) => ({ ...prev, phone: false }));
        }

        // Validate bio
        if (bio.trim().length < 10) {
            setErrors((prev) => ({ ...prev, bio: true }));
            hasError = true;
            toast.error("Bio must be at least 10 characters.");
        } else {
            setErrors((prev) => ({ ...prev, bio: false }));
        }

        if (hasError) return;

        setLoading(true);
        const profileData = {
            image,
            phone,
            bio,
        };

        try {
            const response = await fetch("http://localhost:5000/profile/create-profile", {  // Your backend endpoint
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Profile created successfully!");
            } else {
                toast.error(data.message || "Failed to create profile.");
            }
        } catch (error) {
            toast.error("Error submitting profile data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto my-10 p-6">
            <Toaster position="top-center" expand={true} />
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-center text-xl font-semibold">
                        Create Your Profile
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    {/* Image Upload */}
                    <label htmlFor="fileInput" className="cursor-pointer">
                        <div
                            className={`border-2 border-dashed rounded-full w-40 h-40 flex justify-center items-center overflow-hidden transition-all ${
                                errors.image ? "border-red-500" : "border-gray-300"
                            }`}
                            aria-live="polite"
                        >
                            {image ? (
                                <img src={image} alt="Profile" className="w-full h-full object-cover" />
                            ) : loading ? (
                                <Lottie animationData={LoadingAnimation} />
                            ) : (
                                <Camera className="text-gray-400 w-10 h-10" />
                            )}
                        </div>
                    </label>
                    <Input
                        type="file"
                        id="fileInput"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                        }}
                    />
                </CardContent>

                {/* Phone & Bio Inputs */}
                <CardContent className="flex flex-col gap-4">
                    <div>
                        <Input
                            placeholder="Enter your phone number"
                            className={`py-2 px-3 border rounded-md w-full transition-all ${
                                errors.phone ? "border-red-500" : "border-gray-300"
                            }`}
                            value={phone}
                            onChange={handlePhoneChange}
                        />
                    </div>

                    <div>
                        <Textarea
                            placeholder="Tell us about yourself"
                            className={`py-2 px-3 border rounded-md w-full transition-all ${
                                errors.bio ? "border-red-500" : "border-gray-300"
                            }`}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        />
                    </div>
                </CardContent>

                {/* Submit Button */}
                <CardFooter>
                    <Button
                        onClick={handleSubmit}
                        className="w-full py-3 text-white rounded-md transition-all disabled:bg-gray-800"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex justify-center items-center">
                                <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            "Continue"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
