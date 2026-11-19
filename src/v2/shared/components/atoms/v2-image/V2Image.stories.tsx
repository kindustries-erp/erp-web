import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { ImageOff } from "lucide-react";
import { V2Image } from "./V2Image";

const meta: Meta<typeof V2Image> = {
  title: "Components/Atoms/V2Image",
  component: V2Image,
  tags: ["autodocs"],
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
    fallbackSrc: { control: "text" },
    loading: {
      control: "select",
      options: ["lazy", "eager"],
    },
    className: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof V2Image>;

export const Default: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=300&q=80",
    alt: "Sample Artwork",
    className: "w-32 h-32 object-cover rounded-lg border border-border",
  },
};

export const WithFallbackIcon: Story = {
  args: {
    src: "https://invalid-url.com/broken-image.jpg",
    alt: "Broken image with fallback icon",
    fallbackIcon: <ImageOff className="w-8 h-8 text-muted-foreground" />,
    className: "w-32 h-32 rounded-lg border border-border bg-muted/40",
    containerClassName: "w-32 h-32 rounded-lg border border-border bg-muted/40",
  },
};

export const WithFallbackSrc: Story = {
  args: {
    src: "https://invalid-url.com/broken-image.jpg",
    fallbackSrc:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
    alt: "Image with fallback source URL",
    className: "w-32 h-32 object-cover rounded-lg border border-border",
  },
};

export const AvatarThumbnail: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    alt: "Avatar Thumbnail",
    className: "w-16 h-16 rounded-full object-cover border-2 border-primary/20",
  },
};
