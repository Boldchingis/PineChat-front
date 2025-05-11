// components/CreateProfile.tsx

"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import LoadingAnimation from "@/public/Load.json";
import { Toaster, toast } from "sonner";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function ProfileManager() {
    const [image, setImage] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [errors, setErrors] = useState({
        image: false,
        name: false,
        about: false,
    });
    const [about, setAbout] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [profileExists, setProfileExists] = useState(false);

    const router = useRouter();

    // Fetch user profile data
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) {
                    router.push("/auth");
                    return;
                }

                const response = await fetch("http://localhost:5000/profile/", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("refreshToken");
                        router.push("/auth");
                        return;
                    }
                    throw new Error("Failed to fetch profile");
                }

                const data = await response.json();
                if (data.success) {
                    // User has a profile
                    setName(data.data.name || "");

                    if (data.data.profile) {
                        setImage(data.data.profile.image || null);
                        setAbout(data.data.profile.about || "");
                        setProfileExists(true);
                    } else {
                        setProfileExists(false);
                    }
                }
            } catch (error) {
                toast.error("Failed to load profile data");
                console.error(error);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchProfileData();
    }, [router]);

    // Handle image upload to Cloudinary
    const handleImageUpload = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            setErrors((prev) => ({ ...prev, image: true }));
            toast.error("Invalid image type. Please upload an image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setErrors((prev) => ({ ...prev, image: true }));
            toast.error("Image size is too large. Max size is 5MB.");
            return;
        }

        setLoading(true);

        // Get Cloudinary configuration from environment variables
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "duhir31qk";
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

        // Form data to send to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append("cloud_name", cloudName);

        try {
            // Use the real Cloudinary endpoint with your cloud name
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (data.secure_url) {
                setImage(data.secure_url);
                setIsEditing(true);
                toast.success("Image uploaded successfully!");
            } else {
                toast.error("Failed to upload image.");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Error uploading image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        let hasError = false;

        // Validate name
        if (!name.trim() || name.trim().length < 3) {
            setErrors((prev) => ({ ...prev, name: true }));
            toast.error("Name must be at least 3 characters");
            hasError = true;
        } else {
            setErrors((prev) => ({ ...prev, name: false }));
        }

        // Check if image is required (for new profiles)
        if (!profileExists && !image) {
            setErrors((prev) => ({ ...prev, image: true }));
            toast.error("Please upload a profile picture");
            hasError = true;
        } else {
            setErrors((prev) => ({ ...prev, image: false }));
        }

        // Validate about
        if (!about.trim() || about.trim().length < 10) {
            setErrors((prev) => ({ ...prev, about: true }));
            toast.error("About must be at least 10 characters");
            hasError = true;
        } else {
            setErrors((prev) => ({ ...prev, about: false }));
        }

        if (hasError) return;

        setLoading(true);

        // Prepare the data
        const profileData = {
            name,
            about,
            ...(image && { image }),
        };

        const token = localStorage.getItem("accessToken");
        if (!token) {
            toast.error("You are not authenticated");
            router.push("/auth");
            return;
        }

        try {
            // Determine whether to create or update
            const endpoint = profileExists
                ? "http://localhost:5000/profile/update"
                : "http://localhost:5000/profile/create";

            const method = profileExists ? "PUT" : "POST";

            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(profileExists
                    ? "Profile updated successfully!"
                    : "Profile created successfully!");

                setProfileExists(true);
                setIsEditing(false);

                // Redirect to chat after creating profile
                if (!profileExists) {
                    setTimeout(() => {
                        router.push("/home");
                    }, 1500);
                }
            } else {
                toast.error(data.message || "Failed to save profile");
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            toast.error("Error saving profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="w-20 h-20">
                    <Lottie animationData={LoadingAnimation} />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4">
            <Toaster position="top-center" />

            <div className="max-w-md mx-auto">
                <Button
                    variant="ghost"
                    className="mb-4"
                    onClick={() => router.push("/home")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Chat
                </Button>

                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="text-center text-xl font-semibold">
                            {profileExists ? "Your Profile" : "Create Your Profile"}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="flex flex-col items-center gap-4">
                        {/* Profile Image */}
                        <label htmlFor="fileInput" className="cursor-pointer">
                            <div
                                className={`border-2 ${isEditing || !profileExists ? 'border-dashed' : 'border-solid'}
                                ${errors.image ? "border-red-500" : "border-gray-300"}
                                rounded-full w-40 h-40 flex justify-center items-center overflow-hidden transition-all`}
                            >
                                {image ? (
                                    <Image src={image} width={100} height={100} alt="Profile" className="w-full h-full object-cover" />
                                ) : loading ? (
                                    <div className="w-20 h-20">
                                        <Lottie animationData={LoadingAnimation} />
                                    </div>
                                ) : (
                                    <Camera className="text-gray-400 w-10 h-10" />
                                )}
                            </div>
                            <p className="text-center text-sm text-gray-500 mt-2">
                                {isEditing || !profileExists ? "Click to upload image" : ""}
                            </p>
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

                    {/* Profile Details */}
                    <CardContent className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <Input
                                id="name"
                                placeholder="Enter your name"
                                className={`${errors.name ? "border-red-500" : "border-gray-300"}`}
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setIsEditing(true);
                                }}
                                disabled={loading || (!isEditing && profileExists)}
                            />
                        </div>

                        <div>
                            <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">
                                About
                            </label>
                            <Textarea
                                id="about"
                                placeholder="Tell us about yourself"
                                className={`resize-none ${errors.about ? "border-red-500" : "border-gray-300"}`}
                                value={about}
                                onChange={(e) => {
                                    setAbout(e.target.value);
                                    setIsEditing(true);
                                }}
                                rows={4}
                                disabled={loading || (!isEditing && profileExists)}
                            />
                        </div>
                    </CardContent>

                    {/* Buttons */}
                    <CardFooter className="flex gap-3">
                        {profileExists && !isEditing ? (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="w-full"
                                variant="outline"
                            >
                                Edit Profile
                            </Button>
                        ) : (
                            <>
                                {profileExists && (
                                    <Button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1"
                                        variant="outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                )}
                                <Button
                                    onClick={handleSubmit}
                                    className="flex-1"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex justify-center items-center">
                                            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                                        </div>
                                    ) : profileExists ? "Save Changes" : "Create Profile"}
                                </Button>
                            </>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
