import Image from "next/image";

// Instead of serving images from Vercel's CDN, images are hosted on Amazon S3.
// The API route redirects the client to the external URL, offloading bandwidth costs.
const ImageGallery = () => {
  const images = [
    "https://your-bucket.s3.amazonaws.com/images/image1.jpg",
    "https://your-bucket.s3.amazonaws.com/images/image2.png",
    // Add more image URLs
  ];

  return (
    <div className="image-gallery">
      {images.map((url, index) => (
        <Image
          key={index}
          src={url}
          alt={`Image ${index + 1}`}
          width={600}
          height={400}
          loading="lazy"
        />
      ))}
    </div>
  );
};

export default ImageGallery;
