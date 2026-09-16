@extends('layouts.app')

@section('title', 'Pricing - ' . config('app.name'))

@section('content')
    @include('marketing.partials._pricing')
    @include('marketing.partials._faq')
@endsection
