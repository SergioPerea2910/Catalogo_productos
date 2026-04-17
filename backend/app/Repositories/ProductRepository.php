<?php

namespace App\Repositories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

class ProductRepository
{
    public function getAll(): Collection
    {
        return Product::where('is_active', true)
            ->orderBy('id', 'desc')
            ->get();
    }

    public function create(array $data): Product
    {
        return Product::create($data);
    }

    public function findByIdOrFail(int|string $id): Product
    {
        return Product::findOrFail($id);
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);

        return $product->fresh();
    }

    public function disable(Product $product): Product
    {
        $product->update([
            'is_active' => false,
        ]);

        return $product->fresh();
    }
}
