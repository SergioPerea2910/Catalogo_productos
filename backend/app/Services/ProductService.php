<?php

namespace App\Services;

use App\Models\Product;
use App\Repositories\ProductRepository;
use Illuminate\Database\Eloquent\Collection;

class ProductService
{
    public function __construct(
        private ProductRepository $productRepository
    ) {
    }

    public function list(): Collection
    {
        return $this->productRepository->getAll();
    }

    public function create(array $data): Product
    {
        if (!array_key_exists('is_active', $data)) {
            $data['is_active'] = true;
        }

        return $this->productRepository->create($data);
    }

    public function update(int|string $id, array $data): Product
    {
        $product = $this->productRepository->findByIdOrFail($id);

        return $this->productRepository->update($product, $data);
    }

    public function disable(int|string $id): Product
    {
        $product = $this->productRepository->findByIdOrFail($id);

        return $this->productRepository->disable($product);
    }
}
