export function generateMockRating(){
    // gera um rating entre 3 e 5.0
    const rating = 3 + Math.random() * 2

    // gera um numero de reviews entre 50 e 500
    const reviewCount = Math.floor(50 + Math.random() * 450)

    return {
        rating: Number(rating.toFixed(1)),
        reviewCount
    }
}