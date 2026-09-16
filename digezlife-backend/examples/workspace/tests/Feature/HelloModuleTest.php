<?php

namespace Tests\Feature;

use Tests\TestCase;

class HelloModuleTest extends TestCase
{
    public function test_hello_module_route_is_accessible(): void
    {
        $response = $this->get('/hello-module');

        $response->assertStatus(200);
        $response->assertSee('Hello from HelloModule!');
    }
}
