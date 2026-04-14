import './PostImage.css';

interface PostImageProps {
    images: string[]; 
    alt: string;
}


export default function PostImage({ images, alt }: PostImageProps) {
    //TODO: Add Placeholder image 
    const mainImage = images.length > 0 ? images[0] : '/placeholder.jpg';

    return (
        <div className="product-image">
        <img 
            src={mainImage} 
            alt={alt} 
            className="product-image__content" 
            loading="lazy" 
        />
        {images.length > 1 && (
            <span className="product-image__badge">
            //TODO: Language support
            +{images.length - 1} fotos
            </span>
        )}
        </div>
    );
}