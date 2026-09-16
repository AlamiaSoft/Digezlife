<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => view('welcome'));

use Livewire\Volt\Volt;

Volt::route('/login', 'login')->name('login');
Volt::route('/dashboard', 'dashboard')->middleware('auth')->name('dashboard');
