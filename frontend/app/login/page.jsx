"use client";

import React from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LoginPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const router = useRouter();
  
    const onSubmit = async (values) => {
      try {
        const response = await fetch("http://localhost:8080/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: values.username,
            password: values.password,
          }),
          credentials: "include", // Important: includes the authToken cookie in the response
        });
  
        if (response.ok) {
          router.push("/"); // Redirect to home page after login
        } else {
          alert("Invalid username or password. Please try again.");
        }
      } catch (error) {
        console.error("Error logging in: ", error);
        alert("An error occurred. Please try again.");
      }
    };

    return (
        <div className="w-full h-[100vh] lg:grid lg:grid-cols-2 xl:min-h-[800px]">
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold">Log In</h1>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                {...register("username", {
                                    required: "Username is required",
                                })}
                            />
                            {errors.username && (
                                <span className="text-red-600 text-sm">
                                    {errors.username.message}
                                </span>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters",
                                    },
                                })}
                            />
                            {errors.password && (
                                <span className="text-red-600 text-sm">
                                    {errors.password.message}
                                </span>
                            )}
                        </div>
                        <Button type="submit" className="w-full">
                            Log In
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full flex justify-center items-center"
                            onClick={() => alert("Google login coming soon!")}
                        >
                            <Image
                                className="mr-2"
                                src="/google-logo.png"
                                alt="Google logo"
                                width={20}
                                height={20}
                            />
                            Log In with Google
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="underline">
                            Register
                        </Link>
                    </div>
                </div>
            </div>
            <div className="hidden lg:flex flex-col justify-center items-center bg-black"></div>
        </div>
    );
};

export default LoginPage;
