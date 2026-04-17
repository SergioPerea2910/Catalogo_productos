<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_a_product(): void
    {
        $payload = [
            'sku' => 'PROD-TEST-001',
            'name' => 'Producto de prueba',
            'description' => 'Producto creado desde test',
            'price' => 29.99,
            'type' => 'ebook',
            'is_active' => true,
        ];

        $response = $this->withHeaders([
            'X-API-KEY' => 'test-api-key',
        ])->postJson('/api/products', $payload);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'sku' => 'PROD-TEST-001',
                'name' => 'Producto de prueba',
            ]);

        $this->assertDatabaseHas('products', [
            'sku' => 'PROD-TEST-001',
            'name' => 'Producto de prueba',
        ]);
    }

    public function test_it_validates_required_fields_when_creating_a_product(): void
    {
        $payload = [
            'sku' => '',
            'price' => -10,
        ];

        $response = $this->withHeaders([
            'X-API-KEY' => 'test-api-key',
        ])->postJson('/api/products', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'sku',
                'name',
                'price',
                'type',
            ]);
    }

    public function test_it_requires_an_api_key(): void
    {
        $response = $this->getJson('/api/products');

        $response->assertStatus(401);
    }

    public function test_it_lists_only_active_products(): void
    {
        Product::create([
            'sku' => 'PROD-ACTIVE-001',
            'name' => 'Producto activo',
            'description' => 'Visible en el listado',
            'price' => 10.00,
            'type' => 'ebook',
            'is_active' => true,
        ]);

        Product::create([
            'sku' => 'PROD-INACTIVE-001',
            'name' => 'Producto inactivo',
            'description' => 'No debe verse en el listado',
            'price' => 20.00,
            'type' => 'curso',
            'is_active' => false,
        ]);

        $response = $this->withHeaders([
            'X-API-KEY' => 'test-api-key',
        ])->getJson('/api/products');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment([
                'sku' => 'PROD-ACTIVE-001',
                'name' => 'Producto activo',
            ])
            ->assertJsonMissing([
                'sku' => 'PROD-INACTIVE-001',
                'name' => 'Producto inactivo',
            ]);
    }


    protected function setUp(): void
    {
        parent::setUp();

        config()->set('services.products_api_key', 'test-api-key');
    }

}
